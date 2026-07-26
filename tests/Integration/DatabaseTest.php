<?php

declare(strict_types=1);

use App\Database;

/**
 * Verifies table schema creation, constraints, and upsert behavior against an
 * in-memory SQLite instance.
 */
class DatabaseTest
{
    private Database $db;

    public function setUp(): void
    {
        $this->db = new Database(':memory:');
    }

    public function testSchemaCreatesRatesTableWithExpectedColumns(): void
    {
        $columns = $this->db->pdo()
            ->query('PRAGMA table_info(rates)')
            ->fetchAll();

        $columnNames = array_column($columns, 'name');

        foreach (['date', 'rate_irr_per_usd', 'granularity', 'source', 'open_price', 'low_price', 'high_price', 'close_price', 'change_amount', 'change_percent', 'persian_date'] as $expected) {
            Assert::assertTrue(in_array($expected, $columnNames, true), "Expected column '{$expected}' to exist.");
        }
    }

    public function testDatePrimaryKeyEnforcesUniqueness(): void
    {
        $pdo = $this->db->pdo();
        $pdo->exec("INSERT INTO rates (date, rate_irr_per_usd, granularity, source) VALUES ('2024-01-01', 500000, 'daily', 'test')");

        $threw = false;
        try {
            $pdo->exec("INSERT INTO rates (date, rate_irr_per_usd, granularity, source) VALUES ('2024-01-01', 600000, 'daily', 'test')");
        } catch (\PDOException) {
            $threw = true;
        }

        Assert::assertTrue($threw, 'Expected a primary key constraint violation on duplicate date.');
    }

    public function testGranularityCheckConstraintRejectsInvalidValue(): void
    {
        $pdo = $this->db->pdo();
        $threw = false;

        try {
            $pdo->exec("INSERT INTO rates (date, rate_irr_per_usd, granularity, source) VALUES ('2024-01-01', 500000, 'monthly', 'test')");
        } catch (\PDOException) {
            $threw = true;
        }

        Assert::assertTrue($threw, 'Expected a CHECK constraint violation for an invalid granularity value.');
    }

    public function testUpsertViaInsertOrReplaceDoesNotDuplicateRows(): void
    {
        $pdo = $this->db->pdo();
        $sql = 'INSERT INTO rates (date, rate_irr_per_usd, granularity, source) VALUES (:date, :rate, :granularity, :source)
                ON CONFLICT(date) DO UPDATE SET rate_irr_per_usd = excluded.rate_irr_per_usd';

        $stmt = $pdo->prepare($sql);
        $stmt->execute(['date' => '2024-01-01', 'rate' => 500000, 'granularity' => 'daily', 'source' => 'test']);
        $stmt->execute(['date' => '2024-01-01', 'rate' => 550000, 'granularity' => 'daily', 'source' => 'test']);

        $count = (int) $pdo->query('SELECT COUNT(*) AS c FROM rates')->fetch()['c'];
        Assert::assertSame(1, $count);

        $rate = (float) $pdo->query("SELECT rate_irr_per_usd FROM rates WHERE date = '2024-01-01'")->fetch()['rate_irr_per_usd'];
        Assert::assertEqualsWithDelta(550000.0, $rate, 0.0001);
    }
}
