<?php

declare(strict_types=1);

use App\Calculator;

/**
 * Validates the Calculator's bidirectional conversion equations and
 * purchasing-power delta math, including edge cases and guards.
 */
class CalculatorTest
{
    private Calculator $calculator;

    public function setUp(): void
    {
        $this->calculator = new Calculator();
    }

    public function testUsdToIrrMultipliesByRate(): void
    {
        $result = $this->calculator->usdToIrr(10.0, 500000.0);
        Assert::assertEqualsWithDelta(5000000.0, $result, 0.0001);
    }

    public function testIrrToUsdDividesByRate(): void
    {
        $result = $this->calculator->irrToUsd(5000000.0, 500000.0);
        Assert::assertEqualsWithDelta(10.0, $result, 0.0001);
    }

    public function testRevalueDetectsPurchasingPowerLoss(): void
    {
        // 100,000,000 IRR was worth much more in 2012 (rate 17,400) than in 2024 (rate 603,510).
        $result = $this->calculator->revalue(100000000.0, 17400.0, 603510.0);

        Assert::assertEqualsWithDelta(5747.126436781609, $result['usd_at_a'], 0.001);
        Assert::assertEqualsWithDelta(165.69733724379049, $result['usd_at_b'], 0.001);
        Assert::assertGreaterThan(0, -$result['delta_usd']); // delta_usd is negative
        Assert::assertTrue($result['delta_percent'] < 0);
    }

    public function testRevalueDetectsPurchasingPowerGain(): void
    {
        $result = $this->calculator->revalue(100000000.0, 603510.0, 17400.0);

        Assert::assertTrue($result['delta_usd'] > 0);
        Assert::assertTrue($result['delta_percent'] > 0);
    }

    public function testComparePricesPercentDelta(): void
    {
        // A car costing 50,000,000 IRR in 2012 vs 2,000,000,000 IRR in 2024.
        $result = $this->calculator->comparePrices(50000000.0, 17400.0, 2000000000.0, 603510.0);

        Assert::assertEqualsWithDelta(2873.5632183908046, $result['usd_a'], 0.001);
        Assert::assertEqualsWithDelta(3313.94674487581, $result['usd_b'], 0.001);
        Assert::assertEqualsWithDelta(440.3835264850054, $result['delta_usd'], 0.001);
        Assert::assertEqualsWithDelta(15.325346721678187, $result['delta_percent'], 0.001);
    }

    public function testZeroBaselineUsdProducesNullPercentDelta(): void
    {
        // Baseline USD value rounds to zero only in pathological cases; force it via
        // an extremely small price relative to a very large rate.
        $result = $this->calculator->comparePrices(0.0, 100.0, 500.0, 100.0);
        Assert::assertNull($result['delta_percent']);
    }

    public function testNegativeRateThrowsInvalidArgumentException(): void
    {
        $threw = false;
        try {
            $this->calculator->irrToUsd(1000.0, -100.0);
        } catch (InvalidArgumentException) {
            $threw = true;
        }
        Assert::assertTrue($threw, 'Expected InvalidArgumentException for negative rate.');
    }

    public function testZeroRateThrowsInvalidArgumentException(): void
    {
        $threw = false;
        try {
            $this->calculator->usdToIrr(10.0, 0.0);
        } catch (InvalidArgumentException) {
            $threw = true;
        }
        Assert::assertTrue($threw, 'Expected InvalidArgumentException for zero rate (division-by-zero guard).');
    }

    public function testRoundingPrecisionForLargeAmounts(): void
    {
        // Ensure large integer-like amounts don't lose precision through float math.
        $result = $this->calculator->usdToIrr(1000000.0, 603510.0);
        Assert::assertEqualsWithDelta(603510000000.0, $result, 0.01);
    }
}
