<?php

declare(strict_types=1);

/**
 * Idempotent CSV import CLI script.
 *
 * Parses docs/historic.csv (annual resolution) and docs/Dollar_Rial_Price_Dataset.csv
 * (daily resolution) and upserts rows into the SQLite `rates` table using
 * INSERT OR REPLACE, so repeated runs never create duplicates.
 *
 * Usage: php bin/import_rates.php
 */

require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/Importer.php';

use App\Database;
use App\Importer;

$db = new Database();
$pdo = $db->pdo();

$upsert = $pdo->prepare(<<<'SQL'
    INSERT INTO rates (
        date, rate_irr_per_usd, granularity, source,
        open_price, low_price, high_price, close_price,
        change_amount, change_percent, persian_date
    ) VALUES (
        :date, :rate_irr_per_usd, :granularity, :source,
        :open_price, :low_price, :high_price, :close_price,
        :change_amount, :change_percent, :persian_date
    )
    ON CONFLICT(date) DO UPDATE SET
        rate_irr_per_usd = excluded.rate_irr_per_usd,
        granularity = excluded.granularity,
        source = excluded.source,
        open_price = excluded.open_price,
        low_price = excluded.low_price,
        high_price = excluded.high_price,
        close_price = excluded.close_price,
        change_amount = excluded.change_amount,
        change_percent = excluded.change_percent,
        persian_date = excluded.persian_date
SQL);

$totalImported = 0;
$totalSkipped = 0;

/**
 * @param string $csvPath
 * @param callable(array<string, string>): (array|null) $mapRow Maps a CSV row
 *        (keyed by header) into a row ready for the upsert statement, or null to skip it.
 */
function importCsv(string $csvPath, callable $mapRow, PDOStatement $upsert): array
{
    $imported = 0;
    $skipped = 0;

    $handle = fopen($csvPath, 'r');
    if ($handle === false) {
        fwrite(STDERR, "Unable to open {$csvPath}\n");
        exit(1);
    }

    $header = fgetcsv($handle, escape: '');
    if ($header === false) {
        fclose($handle);
        return [0, 0];
    }

    while (($row = fgetcsv($handle, escape: '')) !== false) {
        if (count($row) !== count($header)) {
            $skipped++;
            continue;
        }

        $assoc = array_combine($header, $row);
        $mapped = $mapRow($assoc);

        if ($mapped === null) {
            $skipped++;
            continue;
        }

        $upsert->execute($mapped);
        $imported++;
    }

    fclose($handle);

    return [$imported, $skipped];
}

// 1. Annual dataset: docs/historic.csv (observation_date, FXRATEIRA618NUPN)
[$imported, $skipped] = importCsv(
    __DIR__ . '/../docs/historic.csv',
    static function (array $row): ?array {
        $date = Importer::normalizeDate($row['observation_date'] ?? null);
        $rate = Importer::cleanNumeric($row['FXRATEIRA618NUPN'] ?? null);

        if ($date === null || $rate === null) {
            return null;
        }

        return [
            'date' => $date,
            'rate_irr_per_usd' => $rate,
            'granularity' => 'annual',
            'source' => 'historic.csv',
            'open_price' => null,
            'low_price' => null,
            'high_price' => null,
            'close_price' => $rate,
            'change_amount' => null,
            'change_percent' => null,
            'persian_date' => null,
        ];
    },
    $upsert
);
$totalImported += $imported;
$totalSkipped += $skipped;
echo "historic.csv: imported {$imported}, skipped {$skipped}\n";

// 2. Daily dataset: docs/Dollar_Rial_Price_Dataset.csv
[$imported, $skipped] = importCsv(
    __DIR__ . '/../docs/Dollar_Rial_Price_Dataset.csv',
    static function (array $row): ?array {
        $date = Importer::normalizeDate($row['Gregorian Date'] ?? null);
        $close = Importer::cleanNumeric($row['Close Price'] ?? null);

        if ($date === null || $close === null) {
            return null;
        }

        return [
            'date' => $date,
            'rate_irr_per_usd' => $close,
            'granularity' => 'daily',
            'source' => 'Dollar_Rial_Price_Dataset.csv',
            'open_price' => Importer::cleanNumeric($row['Open Price'] ?? null),
            'low_price' => Importer::cleanNumeric($row['Low Price'] ?? null),
            'high_price' => Importer::cleanNumeric($row['High Price'] ?? null),
            'close_price' => $close,
            'change_amount' => Importer::cleanNumeric($row['Change Amount'] ?? null),
            'change_percent' => Importer::cleanNumeric($row['Change Percent'] ?? null),
            'persian_date' => trim((string) ($row['Persian Date'] ?? '')) ?: null,
        ];
    },
    $upsert
);
$totalImported += $imported;
$totalSkipped += $skipped;
echo "Dollar_Rial_Price_Dataset.csv: imported {$imported}, skipped {$skipped}\n";

$total = (int) $pdo->query('SELECT COUNT(*) AS c FROM rates')->fetch()['c'];

echo "Total imported/updated: {$totalImported}, skipped: {$totalSkipped}\n";
echo "Total rows in database: {$total}\n";
