<?php

declare(strict_types=1);

namespace App;

use PDO;

/**
 * Rate lookups, nearest-date resolution, and series queries against the `rates` table.
 */
class RateRepository
{
    public function __construct(private readonly Database $db)
    {
    }

    /**
     * Returns the most recent recorded observation, or null when the table is empty.
     */
    public function latest(): ?array
    {
        $stmt = $this->db->pdo()->query(
            'SELECT * FROM rates ORDER BY date DESC LIMIT 1'
        );

        $row = $stmt->fetch();

        return $row === false ? null : $row;
    }

    /**
     * Resolves a requested date to an observation.
     *
     * If no row exists for the exact date (e.g. weekend/holiday), falls back to the
     * nearest preceding available observation. Returns null when there is no data on
     * or before the requested date.
     *
     * @return array{requested_date: string, applied_date: ?string, exact_match: bool, rate: ?array}
     */
    public function lookup(string $date): array
    {
        $stmt = $this->db->pdo()->prepare('SELECT * FROM rates WHERE date = :date LIMIT 1');
        $stmt->execute(['date' => $date]);
        $row = $stmt->fetch();

        if ($row !== false) {
            return [
                'requested_date' => $date,
                'applied_date' => $row['date'],
                'exact_match' => true,
                'rate' => $row,
            ];
        }

        $stmt = $this->db->pdo()->prepare(
            'SELECT * FROM rates WHERE date <= :date ORDER BY date DESC LIMIT 1'
        );
        $stmt->execute(['date' => $date]);
        $fallback = $stmt->fetch();

        return [
            'requested_date' => $date,
            'applied_date' => $fallback === false ? null : $fallback['date'],
            'exact_match' => false,
            'rate' => $fallback === false ? null : $fallback,
        ];
    }

    /**
     * Chronological series of observations for charts and date sliders.
     *
     * @return array<int, array>
     */
    public function series(?string $from = null, ?string $to = null): array
    {
        $sql = 'SELECT * FROM rates WHERE 1 = 1';
        $params = [];

        if ($from !== null) {
            $sql .= ' AND date >= :from';
            $params['from'] = $from;
        }

        if ($to !== null) {
            $sql .= ' AND date <= :to';
            $params['to'] = $to;
        }

        $sql .= ' ORDER BY date ASC';

        $stmt = $this->db->pdo()->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    /**
     * Resolves two dates and returns both applied observations alongside resolution
     * metadata, ready for the Calculator's comparison modes.
     *
     * @return array{date_a: array, date_b: array}
     */
    public function compare(string $dateA, string $dateB): array
    {
        return [
            'date_a' => $this->lookup($dateA),
            'date_b' => $this->lookup($dateB),
        ];
    }

    /**
     * Total number of rows currently stored (used by import verification/tests).
     */
    public function count(): int
    {
        $count = $this->db->pdo()->query('SELECT COUNT(*) AS c FROM rates')->fetch();

        return (int) $count['c'];
    }
}
