<?php

declare(strict_types=1);

namespace App;

/**
 * Pure helper functions for normalizing raw CSV values (dates and numeric metrics)
 * into canonical forms suitable for storage in SQLite.
 */
class Importer
{
    /**
     * Normalizes a raw date string using mixed separators (`/`, `-`, `.`) into the
     * canonical `YYYY-MM-DD` (Gregorian ISO) format.
     *
     * Returns null when the value cannot be parsed as a valid date.
     */
    public static function normalizeDate(?string $raw): ?string
    {
        if ($raw === null) {
            return null;
        }

        $raw = trim($raw);
        if ($raw === '') {
            return null;
        }

        $normalized = str_replace(['/', '.'], '-', $raw);

        if (!preg_match('/^(\d{4})-(\d{1,2})-(\d{1,2})$/', $normalized, $matches)) {
            return null;
        }

        [, $year, $month, $day] = $matches;

        if (!checkdate((int) $month, (int) $day, (int) $year)) {
            return null;
        }

        return sprintf('%04d-%02d-%02d', (int) $year, (int) $month, (int) $day);
    }

    /**
     * Cleans a raw numeric metric cell. Empty strings and `-` placeholders are
     * treated as missing (NULL). Thousands separators (`,`) and trailing `%` signs
     * are stripped before casting to float.
     */
    public static function cleanNumeric(?string $raw): ?float
    {
        if ($raw === null) {
            return null;
        }

        $raw = trim($raw);

        if ($raw === '' || $raw === '-') {
            return null;
        }

        $raw = str_replace([',', '%'], '', $raw);

        if (!is_numeric($raw)) {
            return null;
        }

        return (float) $raw;
    }
}
