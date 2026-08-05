# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary users include Iranian expats, financial analysts, researchers, and individuals needing to convert, analyze, and evaluate real purchasing power changes between the US Dollar (USD) and Iranian Rial (IRR) across historical daily and annual market datasets spanning 1950 to present.

## Product Purpose
Rial Scope is a local-first web application designed to convert USD to IRR, revalue Rial amounts over time in USD terms, compare historical item prices in real US Dollar values, and visually explore 75+ years of daily and annual exchange rate data.

## Positioning
Unlike generic currency converters that rely on live third-party web APIs or smooth out historical data, Rial Scope provides a local-first, offline-capable historical database (1950–present) with transparent trading-day fallback handling and explicit data-gap representation (2010–2011) without artificial linear interpolation.

## Operating Context
- Local web browser environment served via PHP built-in web server (`php -S 127.0.0.1:8090 -t public`).
- Fully local-first and offline-capable: local SQLite storage (`data/rates.db`) and locally vendored frontend assets (Chart.js, flatpickr).
- Responsive viewports (desktop, tablet, mobile) with dual-language support (English LTR and Persian RTL).

## Capabilities and Constraints
- **Backend & Database**: Pure PHP 8.x with native `pdo_sqlite` extension. Strictly **zero external Composer packages or PHP dependencies**.
- **Data Ingestion**: CLI scripts (`bin/import_rates.php`, `bin/update_current.php`) to parse and upsert annual (`historic.csv`) and daily (`current.csv`) rate datasets idempotently.
- **Coverage Gap**: Explicit data gap between 2010-01-01 and 2011-11-26. The backend and UI leave this gap unpopulated and draw visible breaks rather than fake linear interpolations.
- **Date Resolution Fallback**: Nearest preceding observation date automatically applied when a requested date falls on a weekend or non-trading holiday.
- **Workflows**:
  1. *Revalue Amount*: Evaluate single IRR amount across two historical dates to measure USD purchasing power delta.
  2. *USD Converter*: Direct conversion of USD to IRR for a selected date (defaulting to latest available trading date).
  3. *Compare Item Prices*: Evaluate two independent historical Rial item prices in USD terms to determine real cost changes.
  4. *History Explorer*: Chronological log-scale chart of USD/IRR historical exchange rates from 1950 to present.

## Brand Commitments
- **Name**: Rial Scope
- **Design System**: "Precision Finance" warm terracotta/amber palette (`--color-primary: #6f2e19`, `--color-secondary: #88511b`).
- **Typography**: Manrope (headlines), Work Sans (body text), JetBrains Mono (numbers, dates, currency amounts) with system Farsi fallbacks (Tahoma).

## Evidence on Hand
- Historical CSV rate datasets in `docs/historic.csv` (1950–2010 annual data) and `docs/current.csv` (2011–2026 daily data).
- Local SQLite database import pipeline and schema management (`src/Database.php`, `src/Importer.php`, `src/RateRepository.php`).
- Zero-dependency custom test suite in `tests/run_tests.php` covering 47 unit and integration tests.

## Product Principles
1. **Zero PHP Composer Dependencies**: Core logic must rely solely on native PHP standard library features and lightweight local scripts.
2. **Data Integrity & Historical Honesty**: Provide accurate market rate observations without artificial linear interpolation across historical data gaps.
3. **Transparent Date Resolution**: Always inform the user when a weekend or holiday date falls back to a preceding trading observation.
4. **Dual-Language Accessibility**: Full first-class support for English (LTR) and Persian (RTL).

## Accessibility & Inclusion
- Full keyboard focusability (`:focus-visible`) and WCAG-compliant contrast for typography and UI controls.
- RTL layout direction auto-applied when Persian language mode is selected.
