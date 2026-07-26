<?php

declare(strict_types=1);

namespace App;

use PDO;

/**
 * Manages the SQLite connection and schema initialization.
 */
class Database
{
    private PDO $pdo;

    /**
     * @param string $path Filesystem path to the SQLite database file, or ':memory:' for an
     *                     in-memory database (used by the test suite).
     */
    public function __construct(private readonly string $path = __DIR__ . '/../data/rates.db')
    {
        $isMemory = $this->path === ':memory:';

        if (!$isMemory) {
            $dir = dirname($this->path);
            if (!is_dir($dir)) {
                mkdir($dir, 0775, true);
            }
        }

        $this->pdo = new PDO('sqlite:' . $this->path);
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $this->pdo->exec('PRAGMA foreign_keys = ON');
        $this->pdo->exec('PRAGMA journal_mode = WAL');

        $this->initSchema();
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }

    private function initSchema(): void
    {
        $this->pdo->exec(<<<'SQL'
            CREATE TABLE IF NOT EXISTS rates (
                date TEXT PRIMARY KEY,
                rate_irr_per_usd REAL NOT NULL,
                granularity TEXT NOT NULL CHECK (granularity IN ('daily', 'annual')),
                source TEXT NOT NULL,
                open_price REAL,
                low_price REAL,
                high_price REAL,
                close_price REAL,
                change_amount REAL,
                change_percent REAL,
                persian_date TEXT
            )
        SQL);

        $this->pdo->exec(
            'CREATE INDEX IF NOT EXISTS idx_rates_granularity ON rates (granularity)'
        );
    }
}
