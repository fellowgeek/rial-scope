# Product Requirement Document (PRD): USD-IRR Exchange Explorer

## Overview

The **USD-IRR Exchange Explorer** is a responsive, local-first web application designed to explore, convert, and evaluate purchasing-power changes between the US Dollar (USD) and Iranian Rial (IRR) using historical daily and annual market datasets spanning 1950 through mid-2026.

---

## Technical Stack & Constraints

* **Backend:** PHP 8.x (built-in web server support) + SQLite 3 (zero external composer packages).
* **Testing:** Custom, lightweight PHP test runner in `tests/run_tests.php` evaluating unit, integration, and CLI workflow assertions.
* **Frontend:** HTML5, CSS3 (responsive, English-only, LTR), Vanilla JavaScript or light third-party utilities.
* **Third-Party Libraries (Allowed):**
* **Charting:** Modern JS chart libraries (e.g., Chart.js, Lightweight Charts, ApexCharts) are permitted to handle line rendering, tooltips, and non-continuous temporal gaps gracefully.
* **Calendars / Date Pickers:** JS date pickers (e.g., `flatpickr`) are permitted alongside standard native HTML date inputs.


* **Database:** Local, file-based SQLite stored at `data/rates.db` (git-ignored).

---

## Directory Structure

```text
usd-irr/
├── bin/
│   └── import_rates.php         # Idempotent CSV import CLI script
├── data/
│   └── .gitkeep                 # SQLite database storage directory (rates.db ignored)
├── docs/
│   ├── current.csv # 3,908-row daily dataset (Canonical: Close Price)
│   └── historic.csv             # 61-row annual dataset (1950–2010)
├── public/
│   ├── api/
│   │   └── rates.php            # JSON API endpoint dispatcher
│   ├── assets/
│   │   ├── app.js               # Application state, calculations, API & chart integration
│   │   ├── vendor/              # Third-party JS/CSS (Chart library, Calendar library)
│   │   └── styles.css           # Responsive layout styling, incl. today's-rate widget & result cards
│   └── index.php                # Main application entry point & accessible HTML shell
├── src/
│   ├── Calculator.php           # Centralized pure conversion & purchasing-power logic
│   ├── Database.php             # SQLite connection & schema initialization
│   └── RateRepository.php       # Rate lookups, interpolations, and series queries
├── tests/
│   ├── run_tests.php            # Standalone zero-dependency test runner
│   ├── Unit/
│   │   ├── CalculatorTest.php   # Formula, division-by-zero, and delta math tests
│   │   └── ImporterTest.php     # Date cleaning and CSV normalization unit tests
│   └── Integration/
│       ├── ApiEndpointTest.php  # API JSON responses, error codes, and parameters
│       ├── DatabaseTest.php     # Schema creation, transactions, and SQLite queries
│       └── RateRepositoryTest.php # Date resolution fallbacks and range queries
├── .gitignore                   # Ignores data/rates.db and local OS artifacts
└── README.md                    # Setup, import, execution, and testing instructions

```

---

## Step-by-Step Plan

### 1. Application Skeleton & Local Configuration

Set up the PHP entry point, static CSS/JS directories, third-party vendor assets, database connection helpers, git rules, developer execution scripts, and backend test runner skeleton.

### 2. Database Schema & Idempotent CLI Importer

Implement SQLite schema setup in `src/Database.php` and an importer script in `bin/import_rates.php`.

* Parse `docs/historic.csv` (annual resolution) and `docs/current.csv` (daily resolution).
* Canonical date format: `YYYY-MM-DD` (Gregorian ISO).
* Canonical rate field: `Close Price` stored as `rate_irr_per_usd`.
* Clean mixed date separators, cast `-` or missing metrics to `NULL`, and retain original Persian date strings as optional metadata.
* Import using `INSERT OR REPLACE` (upsert) to guarantee safe re-run idempotency.

### 3. Rate Repository & JSON API Dispatcher

Build `src/RateRepository.php` and `public/api/rates.php`.

* **Endpoints Supported:**
* `latest`: Retrieves the most recent recorded observation.
* `series`: Chronological series for charts and date sliders.
* `lookup`: Accepts `date=YYYY-MM-DD`. Resolves exact matches or finds the nearest previous available trading date if the requested date falls on a weekend or holiday.
* `compare`: Accepts two dates (`date_a`, `date_b`) and returns both applied rates alongside resolution metadata.


* **Resolution Metadata:** All responses state requested date, applied observation date, granularity (`daily` vs `annual`), and source file.

### 4. Centralized Calculation Engine (`src/Calculator.php`)

Enforce unified conversion logic:

* **USD to IRR:** $\text{USD} \times \text{Rate}_{\text{IRR/USD}}$
* **IRR to USD:** $\text{IRR} / \text{Rate}_{\text{IRR/USD}}$
* **Revaluation Mode:** Converts a single entered IRR amount across Date A and Date B rates.
* **Two-Price Comparison Mode:** Converts two independent historical IRR item prices (Price A at Date A vs Price B at Date B) to USD to compute true purchasing-power delta:
* Dollar Delta ($\Delta\$ = \$_{\text{Item B}} - \$_{\text{Item A}}$)
* Percentage Delta ($\Delta\% = \frac{\$_{\text{Item B}} - \$_{\text{Item A}}}{\$_{\text{Item A}}} \times 100$)


* **Guards:** Sanitize zero or negative inputs, prevent division-by-zero on baseline changes.

### 5. Responsive Single-Language UI Framework

Construct a clean, single-page, English-only (LTR) UI in `public/index.php`.

* **Persistent Live Rate:** The current USD→IRR rate (from the `latest` API observation) is always visible in the page header, independent of which tab is active, showing the applied rate and its "as of" date.
* **Date & Rate Display:** Show clear, explicit badges whenever a requested date is mapped to a nearby trading observation (e.g., *"Requested: 2023-03-21 → Applied: 2023-03-20"*).
* **Formatters:** Use browser `Intl` (`en-US` locale) APIs for number formatting. Flatpickr provides standard Gregorian calendar input handling.

### 6. Comparison Workflows

Implement two dedicated workflow views/tabs:

1. **Revalue One Amount:** Evaluates how a fixed Rial amount (e.g., 100,000,000 IRR) changed in USD purchasing power between two selected dates.
2. **Compare Item Prices:** Takes two distinct historical item prices (e.g., a car costing 50,000,000 IRR in 2012 vs 2,000,000,000 IRR in 2024) and calculates whether the item got cheaper or more expensive in USD terms.

Both workflows render their results as a row of three responsive cards (Date/Item A, Date/Item B, and a highlighted Delta card showing the dollar and percent change with a color-coded up/down indicator) rather than a plain data table.

### 7. Interactive History Explorer & Charting

Integrate an interactive chart library (e.g., Chart.js or Lightweight Charts) paired with a timeline range slider.

* **Visualizing Coverage Gaps:** Explicitly handle the dataset boundary between `2010-01-01` (end of annual dataset) and `2011-11-26` (start of daily dataset). The chart must render a visible gap or disproof marker rather than drawing a fake linear interpolation line across those missing ~23 months.
* Synchronize hover/click events on the chart directly with input date selectors.

### 8. Validation & Error Handling

* Validate date bounds (1950 to current max dataset date).
* Show graceful client-side messages for empty SQLite database states or malformed numeric inputs.
* Use strict PDO prepared statements for all SQLite interactions.

---

## Backend Testing Plan (`tests/`)

Since external packages like PHPUnit are excluded to maintain zero external composer dependencies, a lightweight assertion runner (`tests/run_tests.php`) will execute all test suites using in-memory SQLite instances (`:memory:`).

### 1. Unit Tests (`tests/Unit/`)

* **`CalculatorTest.php`:**
* Validates bidirectional conversion equations.
* Verifies purchasing-power percent changes across positive, negative, and zero-delta results.
* Tests edge cases: zero baseline amount handling, negative input sanitization, extremely high integer overflow safety, and rounding precision.


* **`ImporterTest.php`:**
* Tests CSV normalization logic for raw dates with mixed separators (`YYYY/MM/DD`, `YYYY-MM-DD`, `YYYY.MM.DD`).
* Asserts proper parsing of empty or `-` metric cells into SQLite `NULL` values.



### 2. Integration & Repository Tests (`tests/Integration/`)

* **`DatabaseTest.php`:**
* Verifies table schema creation, indexes, and primary key constraints on date strings.
* Ensures upsert SQL statements (`INSERT OR REPLACE`) correctly update existing dates without altering row counts.


* **`RateRepositoryTest.php`:**
* Executes query assertions against an in-memory database populated with fixture rows.
* **Exact Lookups:** Returns exact rates for active trading days.
* **Nearest-Date Fallbacks:** Requests weekends, holidays, or leap days and asserts that the repository returns the closest preceding available observation alongside accurate `applied_date` metadata.
* **Series Gaps:** Asserts that range queries correctly include annual and daily resolutions while leaving the 2010–2011 dataset gap unpopulated.


* **`ApiEndpointTest.php`:**
* Simulates request dispatching to `public/api/rates.php`.
* Verifies HTTP status codes (`200 OK`, `400 Bad Request`, `404 Not Found`).
* Validates JSON schema payloads for `latest`, `lookup`, `series`, and `compare` actions.



---

## Technical Decisions Summary

| Decision | Approach |
| --- | --- |
| **Backend Architecture** | Pure PHP 8.x + PDO SQLite with zero Composer dependencies. |
| **Backend Testing** | Custom CLI test suite (`php tests/run_tests.php`) running tests in isolated `:memory:` SQLite instances. |
| **Frontend Libraries** | Open permission to include third-party JS libraries for Charting and Calendar Pickers. |
| **Primary Key / Indexing** | Date (`YYYY-MM-DD`) indexed uniquely in SQLite for $O(1)$ exact lookups and efficient nearest-neighbor range queries. |
| **Date Fallbacks** | If a user selects a non-trading date (weekend/holiday), automatically pick the nearest preceding observation and inform the user visually. |
| **Data Boundary Rule** | Coverage contains annual data (1950–2010) and daily data (2011-11-26–2026-07-21). The gap between 2010 and late 2011 is strictly declared as non-continuous. |

---

## Verification & Acceptance Checklist

1. **Import Verification:** `php bin/import_rates.php` populates `data/rates.db` with exactly 3,969 total rows without duplicates on re-runs.
2. **Backend Test Suite:** Executing `php tests/run_tests.php` returns a zero exit code (`0`) and passes all Unit, Repository, Importer, and API integration assertions.
3. **API Verification:** `public/api/rates.php?action=lookup&date=2024-03-22` correctly falls back to the nearest active trading date and returns metadata explaining the resolution.
4. **UI/UX Verification:**
* The current USD→IRR rate is visible in the header at all times, on every tab, and updates from the `latest` API observation on page load.
* Revalue and Compare results render as a set of visually distinct cards (not a table), with the delta card color-coded for gains/losses.
* Third-party chart renders cleanly on desktop and mobile viewports with an explicit visual break during the 2010–2011 data gap.