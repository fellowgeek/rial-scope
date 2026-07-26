<?php

declare(strict_types=1);

use App\Importer;

/**
 * Tests CSV normalization logic for raw dates with mixed separators and
 * numeric metric cleaning (empty/"-" placeholders, commas, percent signs).
 */
class ImporterTest
{
    public function testNormalizeDateAcceptsSlashSeparator(): void
    {
        Assert::assertSame('2026-07-21', Importer::normalizeDate('2026/07/21'));
    }

    public function testNormalizeDateAcceptsDashSeparator(): void
    {
        Assert::assertSame('2010-01-01', Importer::normalizeDate('2010-01-01'));
    }

    public function testNormalizeDateAcceptsDotSeparator(): void
    {
        Assert::assertSame('2010-01-01', Importer::normalizeDate('2010.01.01'));
    }

    public function testNormalizeDatePadsSingleDigitMonthAndDay(): void
    {
        Assert::assertSame('2026-07-01', Importer::normalizeDate('2026/7/1'));
    }

    public function testNormalizeDateRejectsInvalidCalendarDate(): void
    {
        Assert::assertNull(Importer::normalizeDate('2026/02/30'));
    }

    public function testNormalizeDateRejectsGarbageInput(): void
    {
        Assert::assertNull(Importer::normalizeDate('not-a-date'));
    }

    public function testNormalizeDateRejectsEmptyOrNull(): void
    {
        Assert::assertNull(Importer::normalizeDate(''));
        Assert::assertNull(Importer::normalizeDate(null));
    }

    public function testCleanNumericParsesPlainNumber(): void
    {
        Assert::assertEqualsWithDelta(1903000.0, Importer::cleanNumeric('1903000'), 0.0001);
    }

    public function testCleanNumericTreatsDashAsNull(): void
    {
        Assert::assertNull(Importer::cleanNumeric('-'));
    }

    public function testCleanNumericTreatsEmptyStringAsNull(): void
    {
        Assert::assertNull(Importer::cleanNumeric(''));
        Assert::assertNull(Importer::cleanNumeric(null));
    }

    public function testCleanNumericStripsPercentSign(): void
    {
        Assert::assertEqualsWithDelta(1.39, Importer::cleanNumeric('1.39%'), 0.0001);
    }

    public function testCleanNumericStripsThousandsSeparators(): void
    {
        Assert::assertEqualsWithDelta(1903000.0, Importer::cleanNumeric('1,903,000'), 0.0001);
    }

    public function testCleanNumericRejectsNonNumericGarbage(): void
    {
        Assert::assertNull(Importer::cleanNumeric('n/a'));
    }
}
