<?php

declare(strict_types=1);

/**
 * Downloads the latest daily USD/IRR price CSV from the public
 * kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset GitHub repository, saves it
 * as docs/current.csv, and re-runs the import so the SQLite database picks
 * up the new rows.
 *
 * Usage: php bin/update_current_csv.php
 */

const SOURCE_URL = 'https://raw.githubusercontent.com/kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset/refs/heads/main/data/Dollar_Rial_Price_Dataset.csv';
const DEST_PATH = __DIR__ . '/../docs/current.csv';

function downloadCsv(string $url): string
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'usd-irr-exchange-explorer/1.0',
    ]);

    $body = curl_exec($ch);
    $error = curl_error($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($body === false) {
        fwrite(STDERR, "Download failed: {$error}\n");
        exit(1);
    }

    if ($status !== 200) {
        fwrite(STDERR, "Download failed: HTTP {$status}\n");
        exit(1);
    }

    return $body;
}

$csv = downloadCsv(SOURCE_URL);

$firstLine = strtok($csv, "\n");
if ($firstLine === false || !str_contains($firstLine, 'Gregorian Date') || !str_contains($firstLine, 'Close Price')) {
    fwrite(STDERR, "Downloaded content does not look like the expected CSV (unexpected header).\n");
    exit(1);
}

$tmpPath = DEST_PATH . '.tmp';
if (file_put_contents($tmpPath, $csv) === false) {
    fwrite(STDERR, "Unable to write temporary file {$tmpPath}\n");
    exit(1);
}
rename($tmpPath, DEST_PATH);

$lineCount = substr_count($csv, "\n");
echo "Downloaded docs/current.csv ({$lineCount} lines)\n";

require __DIR__ . '/import_rates.php';
