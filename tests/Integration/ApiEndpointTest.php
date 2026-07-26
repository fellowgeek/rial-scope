<?php

declare(strict_types=1);

use App\Calculator;
use App\Database;
use App\RateRepository;

// Loads dispatchRatesAction() and its helper functions without triggering the
// live HTTP request handling at the bottom of public/api/rates.php.
if (!defined('RATES_API_NO_DISPATCH')) {
    define('RATES_API_NO_DISPATCH', true);
}
require_once __DIR__ . '/../../public/api/rates.php';

/**
 * Simulates request dispatching to public/api/rates.php by calling the same
 * dispatchRatesAction() function the live endpoint uses, against an in-memory
 * fixture database. Verifies HTTP status codes and JSON payload shapes for
 * latest, lookup, series, and compare.
 */
class ApiEndpointTest
{
    private RateRepository $repository;
    private Calculator $calculator;

    public function setUp(): void
    {
        $db = new Database(':memory:');
        $pdo = $db->pdo();

        $stmt = $pdo->prepare(
            'INSERT INTO rates (date, rate_irr_per_usd, granularity, source) VALUES (:date, :rate, :granularity, :source)'
        );

        foreach ([
            ['2010-01-01', 10254.17647000, 'annual', 'historic.csv'],
            ['2011-11-26', 13700, 'daily', 'current.csv'],
            ['2012-01-01', 17400, 'daily', 'current.csv'],
            ['2024-03-17', 603510, 'daily', 'current.csv'],
            ['2024-03-20', 605000, 'daily', 'current.csv'],
        ] as [$date, $rate, $granularity, $source]) {
            $stmt->execute(['date' => $date, 'rate' => $rate, 'granularity' => $granularity, 'source' => $source]);
        }

        $this->repository = new RateRepository($db);
        $this->calculator = new Calculator();
    }

    private function dispatch(?string $action, array $params): array
    {
        return dispatchRatesAction($this->repository, $this->calculator, $action, $params);
    }

    public function testMissingActionReturns400(): void
    {
        [$status, $payload] = $this->dispatch(null, []);
        Assert::assertSame(400, $status);
        Assert::assertNotNull($payload['error']);
    }

    public function testUnknownActionReturns404(): void
    {
        [$status] = $this->dispatch('bogus', []);
        Assert::assertSame(404, $status);
    }

    public function testLatestReturns200WithMostRecentObservation(): void
    {
        [$status, $payload] = $this->dispatch('latest', []);
        Assert::assertSame(200, $status);
        Assert::assertSame('2024-03-20', $payload['date']);
    }

    public function testLookupExactMatchReturns200(): void
    {
        [$status, $payload] = $this->dispatch('lookup', ['date' => '2012-01-01']);
        Assert::assertSame(200, $status);
        Assert::assertTrue($payload['exact_match']);
        Assert::assertSame('2012-01-01', $payload['applied_date']);
    }

    public function testLookupFallsBackToNearestPrecedingTradingDate(): void
    {
        // 2024-03-18 has no trading data in the fixture; nearest prior is 2024-03-17.
        [$status, $payload] = $this->dispatch('lookup', ['date' => '2024-03-18']);
        Assert::assertSame(200, $status);
        Assert::assertFalse($payload['exact_match']);
        Assert::assertSame('2024-03-17', $payload['applied_date']);
    }

    public function testLookupMissingDateReturns400(): void
    {
        [$status] = $this->dispatch('lookup', []);
        Assert::assertSame(400, $status);
    }

    public function testLookupOutOfBoundsDateReturns400(): void
    {
        [$status] = $this->dispatch('lookup', ['date' => '1900-01-01']);
        Assert::assertSame(400, $status);
    }

    public function testSeriesReturns200WithCountAndRows(): void
    {
        [$status, $payload] = $this->dispatch('series', []);
        Assert::assertSame(200, $status);
        Assert::assertSame(5, $payload['count']);
        Assert::assertCount(5, $payload['series']);
    }

    public function testCompareReturnsBothResolvedDates(): void
    {
        [$status, $payload] = $this->dispatch('compare', [
            'date_a' => '2012-01-01',
            'date_b' => '2024-03-18',
        ]);

        Assert::assertSame(200, $status);
        Assert::assertSame('2012-01-01', $payload['date_a']['applied_date']);
        Assert::assertSame('2024-03-17', $payload['date_b']['applied_date']);
    }

    public function testCompareWithIrrAmountIncludesRevaluePayload(): void
    {
        [$status, $payload] = $this->dispatch('compare', [
            'date_a' => '2012-01-01',
            'date_b' => '2024-03-18',
            'irr_amount' => '100000000',
        ]);

        Assert::assertSame(200, $status);
        Assert::assertNotNull($payload['revalue']);
        Assert::assertTrue($payload['revalue']['delta_usd'] < 0);
    }

    public function testCompareWithPricesIncludesItemComparisonPayload(): void
    {
        [$status, $payload] = $this->dispatch('compare', [
            'date_a' => '2012-01-01',
            'date_b' => '2024-03-18',
            'price_a' => '50000000',
            'price_b' => '2000000000',
        ]);

        Assert::assertSame(200, $status);
        Assert::assertNotNull($payload['compare_items']);
    }

    public function testCompareMissingDatesReturns400(): void
    {
        [$status] = $this->dispatch('compare', ['date_a' => '2012-01-01']);
        Assert::assertSame(400, $status);
    }
}
