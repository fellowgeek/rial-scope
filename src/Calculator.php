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
     * and reports the resulting USD purchasing-power delta.
     *
     * @return array{usd_at_a: float, usd_at_b: float, delta_usd: float, delta_percent: ?float}
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
        ];
    }

    /**
     * Two-price comparison mode: converts two independent historical IRR item prices
     * (Price A at Date A vs Price B at Date B) into USD and computes the purchasing
     * power delta between them.
     *
     * @return array{usd_a: float, usd_b: float, delta_usd: float, delta_percent: ?float}
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
        ];
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
