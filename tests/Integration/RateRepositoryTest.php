<?php

declare(strict_types=1);

use App\Database;
use App\RateRepository;

/**
 * Executes query assertions against an in-memory database populated with fixture
 * rows spanning the annual/daily granularity boundary and a simulated weekend gap.
 */
class RateRepositoryTest
{
    private RateRepository $repository;

    public function setUp(): void
    {
        $db = new Database(':memory:');
        $pdo = $db->pdo();

        $stmt = $pdo->prepare(
            'INSERT INTO rates (date, rate_irr_per_usd, granularity, source) VALUES (:date, :rate, :granularity, :source)'
        );

        $fixtures = [
            ['2009-01-01', 9864.30245600, 'annual', 'historic.csv'],
            ['2010-01-01', 10254.17647000, 'annual', 'historic.csv'],
            // Deliberate ~695 day coverage gap between annual and daily datasets.
            ['2011-11-26', 13700, 'daily', 'current.csv'],
            ['2011-11-27', 13440, 'daily', 'current.csv'],
            ['2011-11-28', 13350, 'daily', 'current.csv'],
            // 2011-11-29 (weekend) intentionally missing.
            ['2011-11-30', 13580, 'daily', 'current.csv'],
            ['2011-12-03', 13638, 'daily', 'current.csv'],
        ];

        foreach ($fixtures as [$date, $rate, $granularity, $source]) {
            $stmt->execute(['date' => $date, 'rate' => $rate, 'granularity' => $granularity, 'source' => $source]);
        }

        $this->repository = new RateRepository($db);
    }

    public function testExactLookupReturnsSameDateForActiveTradingDay(): void
    {
        $result = $this->repository->lookup('2011-11-27');

        Assert::assertTrue($result['exact_match']);
        Assert::assertSame('2011-11-27', $result['applied_date']);
        Assert::assertEqualsWithDelta(13440.0, $result['rate']['rate_irr_per_usd'], 0.0001);
    }

    public function testFallbackToPrecedingDateOnWeekendGap(): void
    {
        $result = $this->repository->lookup('2011-11-29');

        Assert::assertFalse($result['exact_match']);
        Assert::assertSame('2011-11-28', $result['applied_date']);
        Assert::assertEqualsWithDelta(13350.0, $result['rate']['rate_irr_per_usd'], 0.0001);
    }

    public function testLookupReturnsNullApplicationWhenNoPriorDataExists(): void
    {
        $result = $this->repository->lookup('2000-01-01');

        Assert::assertFalse($result['exact_match']);
        Assert::assertNull($result['applied_date']);
        Assert::assertNull($result['rate']);
    }

    public function testSeriesLeavesTheAnnualDailyGapUnpopulated(): void
    {
        $rows = $this->repository->series('2010-01-02', '2011-11-25');
        Assert::assertCount(0, $rows);
    }

    public function testSeriesIncludesBothAnnualAndDailyGranularities(): void
    {
        $rows = $this->repository->series();

        $granularities = array_unique(array_column($rows, 'granularity'));
        sort($granularities);

        Assert::assertSame(['annual', 'daily'], $granularities);
        Assert::assertCount(7, $rows);
    }

    public function testLatestReturnsMostRecentObservation(): void
    {
        $latest = $this->repository->latest();

        Assert::assertSame('2011-12-03', $latest['date']);
    }

    public function testCompareResolvesBothRequestedDatesIndependently(): void
    {
        $result = $this->repository->compare('2011-11-27', '2011-11-29');

        Assert::assertTrue($result['date_a']['exact_match']);
        Assert::assertSame('2011-11-27', $result['date_a']['applied_date']);

        Assert::assertFalse($result['date_b']['exact_match']);
        Assert::assertSame('2011-11-28', $result['date_b']['applied_date']);
    }
}
