<?php

declare(strict_types=1);

namespace App;

use InvalidArgumentException;

/**
 * Centralized, pure conversion and purchasing-power calculation logic.
 *
 * All methods are side-effect free and operate purely on the numbers passed in;
 * they know nothing about dates, rate resolution, or persistence.
 */
class Calculator
{
    /**
     * Convert a USD amount into IRR using the given IRR-per-USD rate.
     */
    public function usdToIrr(float $usdAmount, float $rateIrrPerUsd): float
    {
        $this->assertPositive($rateIrrPerUsd, 'rate');

        return $usdAmount * $rateIrrPerUsd;
    }

    /**
     * Convert an IRR amount into USD using the given IRR-per-USD rate.
     */
    public function irrToUsd(float $irrAmount, float $rateIrrPerUsd): float
    {
        $this->assertPositive($rateIrrPerUsd, 'rate');

        return $irrAmount / $rateIrrPerUsd;
    }

    /**
     * Revaluation mode: converts a single IRR amount at two different dates' rates
     * and reports the resulting USD purchasing-power delta and Rial value change.
     *
     * @return array{usd_at_a: float, usd_at_b: float, delta_usd: float, delta_percent: ?float, rial_value_delta_percent: ?float, exchange_rate_delta_percent: ?float, rate_a: float, rate_b: float}
     */
    public function revalue(float $irrAmount, float $rateA, float $rateB): array
    {
        $this->assertPositive($rateA, 'rateA');
        $this->assertPositive($rateB, 'rateB');

        $usdAtA = $this->irrToUsd($irrAmount, $rateA);
        $usdAtB = $this->irrToUsd($irrAmount, $rateB);

        return [
            'usd_at_a' => $usdAtA,
            'usd_at_b' => $usdAtB,
            'delta_usd' => $usdAtB - $usdAtA,
            'delta_percent' => $this->percentDelta($usdAtA, $usdAtB),
            'rial_value_delta_percent' => $this->rialValueDeltaPercent($rateA, $rateB),
            'exchange_rate_delta_percent' => $this->exchangeRateDeltaPercent($rateA, $rateB),
            'rate_a' => $rateA,
            'rate_b' => $rateB,
        ];
    }

    /**
     * Two-price comparison mode: converts two independent historical IRR item prices
     * (Price A at Date A vs Price B at Date B) into USD and computes the purchasing
     * power delta between them, as well as the underlying Rial currency value change.
     *
     * @return array{usd_a: float, usd_b: float, delta_usd: float, delta_percent: ?float, rial_value_delta_percent: ?float, exchange_rate_delta_percent: ?float, rate_a: float, rate_b: float}
     */
    public function comparePrices(float $priceAIrr, float $rateA, float $priceBIrr, float $rateB): array
    {
        $this->assertPositive($rateA, 'rateA');
        $this->assertPositive($rateB, 'rateB');

        $usdA = $this->irrToUsd($priceAIrr, $rateA);
        $usdB = $this->irrToUsd($priceBIrr, $rateB);

        return [
            'usd_a' => $usdA,
            'usd_b' => $usdB,
            'delta_usd' => $usdB - $usdA,
            'delta_percent' => $this->percentDelta($usdA, $usdB),
            'rial_value_delta_percent' => $this->rialValueDeltaPercent($rateA, $rateB),
            'exchange_rate_delta_percent' => $this->exchangeRateDeltaPercent($rateA, $rateB),
            'rate_a' => $rateA,
            'rate_b' => $rateB,
        ];
    }

    /**
     * Calculates the percentage change in the purchasing power of 1 Rial in USD terms
     * from Rate A to Rate B: ((1/RateB - 1/RateA) / (1/RateA)) * 100 = ((RateA / RateB) - 1) * 100.
     */
    public function rialValueDeltaPercent(float $rateA, float $rateB): ?float
    {
        $this->assertPositive($rateA, 'rateA');
        $this->assertPositive($rateB, 'rateB');

        return (($rateA / $rateB) - 1.0) * 100.0;
    }

    /**
     * Calculates the percentage change in the USD/IRR exchange rate from Rate A to Rate B:
     * ((RateB - RateA) / RateA) * 100.
     */
    public function exchangeRateDeltaPercent(float $rateA, float $rateB): ?float
    {
        $this->assertPositive($rateA, 'rateA');
        $this->assertPositive($rateB, 'rateB');

        return (($rateB - $rateA) / $rateA) * 100.0;
    }

    /**
     * Percentage delta between a baseline value and a new value.
     * Returns null when the baseline is zero to avoid division-by-zero.
     */
    private function percentDelta(float $baseline, float $new): ?float
    {
        if (abs($baseline) < PHP_FLOAT_EPSILON) {
            return null;
        }

        return (($new - $baseline) / $baseline) * 100.0;
    }

    private function assertPositive(float $value, string $name): void
    {
        if ($value <= 0) {
            throw new InvalidArgumentException("Value '{$name}' must be a positive, non-zero number.");
        }
    }
}
