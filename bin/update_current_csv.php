<?php

declare(strict_types=1);

/**
 * Downloads the latest daily USD/IRR price CSV from the public
 * kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset GitHub repository, saves it
 * as docs/current.csv, and re-runs the import so the SQLite database picks
 * up the new rows.
 *
 * Falls back to scraping today's USD/IRR rate directly from the tgju.org
 * dollar price profile page and upserting a single row for today's date
 * into docs/current.csv whenever the primary source can't provide it:
 *   - the download fails outright (network error, non-200 response, or
 *     unexpected content), or
 *   - the download succeeds but the dataset doesn't yet include a row for
 *     today's date (the upstream dataset hasn't been refreshed yet).
 *
 * Usage: php bin/update_current_csv.php
 */

require_once __DIR__ . '/../src/Importer.php';

use App\Importer;

const SOURCE_URL = 'https://raw.githubusercontent.com/kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset/refs/heads/main/data/Dollar_Rial_Price_Dataset.csv';
const TGJU_URL = 'https://www.tgju.org/profile/price_dollar_rl';
const DEST_PATH = __DIR__ . '/../docs/current.csv';
const CSV_HEADER = ['Open Price', 'Low Price', 'High Price', 'Close Price', 'Change Amount', 'Change Percent', 'Gregorian Date', 'Persian Date'];

function downloadCsv(string $url): ?string
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15',
    ]);

    $body = curl_exec($ch);
    $error = curl_error($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($body === false) {
        fwrite(STDERR, "Download failed: {$error}\n");
        return null;
    }

    if ($status !== 200) {
        fwrite(STDERR, "Download failed: HTTP {$status}\n");
        return null;
    }

    return $body;
}

/**
 * Fetches the tgju.org dollar price profile page and extracts today's
 * USD/IRR rate (in Rials) from the "top-mobile-block" current-rate widget.
 *
 * That page repeats similarly-structured price blocks elsewhere, so the
 * lookup is scoped to the `div.top-mobile-block` that contains an element
 * with `data-target="profile-tour-current_rate"`, and reads the
 * `span.price[data-col="info.last_trade.PDrCotVal"]` inside it.
 *
 * Returns null if the page can't be downloaded or the value can't be found.
 */
function fetchTgjuCurrentRate(): ?float
{
    $ch = curl_init(TGJU_URL);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15',
    ]);

    $html = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($html === false || $status !== 200) {
        fwrite(STDERR, "tgju.org fetch failed (HTTP {$status})\n");
        return null;
    }

    return extractTgjuRate($html);
}

/**
 * Parses the tgju.org profile page HTML and returns the current USD/IRR
 * rate found inside `div.top-mobile-block [data-target=profile-tour-current_rate]
 * span.price[data-col=info.last_trade.PDrCotVal]`.
 */
function extractTgjuRate(string $html): ?float
{
    $previousErrorSetting = libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    $dom->loadHTML($html);
    libxml_clear_errors();
    libxml_use_internal_errors($previousErrorSetting);

    $xpath = new DOMXPath($dom);
    $nodes = $xpath->query(
        "//div[contains(concat(' ', normalize-space(@class), ' '), ' top-mobile-block ')]"
        . "//*[@data-target='profile-tour-current_rate']"
        . "//span[contains(concat(' ', normalize-space(@class), ' '), ' price ') and @data-col='info.last_trade.PDrCotVal']"
    );

    if ($nodes === false || $nodes->length === 0) {
        return null;
    }

    return Importer::cleanNumeric($nodes->item(0)->textContent);
}

/**
 * Upserts a single fallback row for the given Gregorian date (format
 * `YYYY/MM/DD`, matching the existing docs/current.csv convention) into the
 * CSV, replacing any existing row for that same date. Only the close price
 * is known from the tgju.org fallback, so the other numeric columns are
 * left blank (they're optional/nullable to the importer).
 */
function upsertFallbackRow(string $csvPath, string $date, float $closePrice): void
{
    $header = CSV_HEADER;
    $dateColumn = array_search('Gregorian Date', $header, true);

    $rows = [];
    if (file_exists($csvPath)) {
        $handle = fopen($csvPath, 'r');
        if ($handle !== false) {
            $fileHeader = fgetcsv($handle, escape: '');
            if ($fileHeader !== false) {
                $header = $fileHeader;
                $dateColumn = array_search('Gregorian Date', $header, true);
            }

            while (($row = fgetcsv($handle, escape: '')) !== false) {
                if ($dateColumn !== false && ($row[$dateColumn] ?? null) === $date) {
                    continue; // dropped: replaced by the fresh fallback row below
                }
                $rows[] = $row;
            }
            fclose($handle);
        }
    }

    $newRow = array_fill(0, count($header), '');
    if ($dateColumn !== false) {
        $newRow[$dateColumn] = $date;
    }
    $closeColumn = array_search('Close Price', $header, true);
    if ($closeColumn !== false) {
        $newRow[$closeColumn] = number_format($closePrice, 0, '.', '');
    }

    array_unshift($rows, $newRow);

    $tmpPath = $csvPath . '.tmp';
    $handle = fopen($tmpPath, 'w');
    if ($handle === false) {
        fwrite(STDERR, "Unable to write temporary file {$tmpPath}\n");
        exit(1);
    }
    fputcsv($handle, $header, escape: '');
    foreach ($rows as $row) {
        fputcsv($handle, $row, escape: '');
    }
    fclose($handle);
    rename($tmpPath, $csvPath);
}

/**
 * Checks whether the CSV at $csvPath already contains a row for the given
 * Gregorian date (format `YYYY/MM/DD`, matching the file's existing
 * `/`-separated style).
 */
function csvHasDateRow(string $csvPath, string $date): bool
{
    if (!file_exists($csvPath)) {
        return false;
    }

    $handle = fopen($csvPath, 'r');
    if ($handle === false) {
        return false;
    }

    $header = fgetcsv($handle, escape: '');
    $dateColumn = $header !== false ? array_search('Gregorian Date', $header, true) : false;

    $found = false;
    if ($dateColumn !== false) {
        while (($row = fgetcsv($handle, escape: '')) !== false) {
            if (($row[$dateColumn] ?? null) === $date) {
                $found = true;
                break;
            }
        }
    }

    fclose($handle);

    return $found;
}

$csv = downloadCsv(SOURCE_URL);

if ($csv !== null) {
    $firstLine = strtok($csv, "\n");
    if ($firstLine === false || !str_contains($firstLine, 'Gregorian Date') || !str_contains($firstLine, 'Close Price')) {
        fwrite(STDERR, "Downloaded content does not look like the expected CSV (unexpected header).\n");
        $csv = null;
    }
}

$today = date('Y/m/d');

if ($csv !== null) {
    $tmpPath = DEST_PATH . '.tmp';
    if (file_put_contents($tmpPath, $csv) === false) {
        fwrite(STDERR, "Unable to write temporary file {$tmpPath}\n");
        exit(1);
    }
    rename($tmpPath, DEST_PATH);

    $lineCount = substr_count($csv, "\n");
    echo "Downloaded docs/current.csv ({$lineCount} lines)\n";

    if (!csvHasDateRow(DEST_PATH, $today)) {
        fwrite(STDERR, "Downloaded dataset does not yet include today's rate, falling back to tgju.org...\n");

        $rate = fetchTgjuCurrentRate();
        if ($rate === null) {
            fwrite(STDERR, "tgju.org fallback also failed; continuing with the downloaded dataset only.\n");
        } else {
            upsertFallbackRow(DEST_PATH, $today, $rate);
            echo "Updated docs/current.csv using tgju.org fallback rate: {$rate}\n";
        }
    }
} else {
    fwrite(STDERR, "Primary CSV download failed, falling back to tgju.org for today's rate...\n");

    $rate = fetchTgjuCurrentRate();
    if ($rate === null) {
        fwrite(STDERR, "tgju.org fallback also failed. Unable to update the current exchange rate.\n");
        exit(1);
    }

    upsertFallbackRow(DEST_PATH, $today, $rate);
    echo "Updated docs/current.csv using tgju.org fallback rate: {$rate}\n";
}

require __DIR__ . '/import_rates.php';
