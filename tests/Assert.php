<?php

declare(strict_types=1);

/**
 * Zero-dependency assertion helpers shared by all test suites.
 *
 * Each assertion throws a RuntimeException on failure; tests/run_tests.php
 * catches these to report failures without external testing frameworks.
 */
class Assert
{
    public static function assertTrue(mixed $condition, string $message = 'Failed asserting that value is true.'): void
    {
        if ($condition !== true) {
            throw new RuntimeException($message);
        }
    }

    public static function assertFalse(mixed $condition, string $message = 'Failed asserting that value is false.'): void
    {
        if ($condition !== false) {
            throw new RuntimeException($message);
        }
    }

    public static function assertNull(mixed $actual, string $message = 'Failed asserting that value is null.'): void
    {
        if ($actual !== null) {
            throw new RuntimeException($message);
        }
    }

    public static function assertNotNull(mixed $actual, string $message = 'Failed asserting that value is not null.'): void
    {
        if ($actual === null) {
            throw new RuntimeException($message);
        }
    }

    public static function assertSame(mixed $expected, mixed $actual, string $message = ''): void
    {
        if ($expected !== $actual) {
            throw new RuntimeException($message ?: sprintf(
                'Failed asserting that %s is identical to expected %s.',
                var_export($actual, true),
                var_export($expected, true)
            ));
        }
    }

    public static function assertEquals(mixed $expected, mixed $actual, string $message = ''): void
    {
        if ($expected != $actual) { // phpcs:ignore -- intentional loose comparison for numeric/string equivalence
            throw new RuntimeException($message ?: sprintf(
                'Failed asserting that %s equals expected %s.',
                var_export($actual, true),
                var_export($expected, true)
            ));
        }
    }

    public static function assertEqualsWithDelta(float $expected, float $actual, float $delta, string $message = ''): void
    {
        if (abs($expected - $actual) > $delta) {
            throw new RuntimeException($message ?: sprintf(
                'Failed asserting that %f equals expected %f within delta %f.',
                $actual,
                $expected,
                $delta
            ));
        }
    }

    public static function assertGreaterThan(float $expected, float $actual, string $message = ''): void
    {
        if (!($actual > $expected)) {
            throw new RuntimeException($message ?: "Failed asserting that {$actual} is greater than {$expected}.");
        }
    }

    public static function assertCount(int $expectedCount, countable|array $actual, string $message = ''): void
    {
        $actualCount = count($actual);
        if ($actualCount !== $expectedCount) {
            throw new RuntimeException($message ?: "Failed asserting that count {$actualCount} matches expected {$expectedCount}.");
        }
    }

    public static function fail(string $message): void
    {
        throw new RuntimeException($message);
    }
}
