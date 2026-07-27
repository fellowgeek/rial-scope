# Rial Scope

A local-first web application for exploring, converting, and evaluating
purchasing-power changes between the US Dollar (USD) and Iranian Rial (IRR)
using historical daily (2011–2026) and annual (1950–2010) exchange rate
datasets. The UI is bilingual (English/Farsi) with full RTL support and
follows the "Precision Finance" design system documented in
[`docs/design/DESIGN.md`](docs/design/DESIGN.md).

## Requirements

* PHP 8.x with the `pdo_sqlite` extension (no Composer dependencies).

## Setup

1. Import the CSV datasets into the local SQLite database (`data/rates.db`,
   git-ignored, created automatically):

   ```bash
   php bin/import_rates.php
   ```

   This is idempotent — re-running it upserts rows without creating
   duplicates. A successful run reports 61 annual rows plus one daily row
   per trading day in `docs/current.csv` (currently 3,974 total rows and
   growing as new daily rates are appended over time).

2. (Optional) Refresh `docs/current.csv` with the latest daily rates and
   re-import it in one step:

   ```bash
   php bin/update_current_csv.php
   ```

   This downloads the latest CSV from the
   [kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset](https://github.com/kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset)
   repository, overwrites `docs/current.csv`, and re-runs the same import
   logic as `bin/import_rates.php`. If the download fails, or if the
   downloaded file doesn't yet include a row for today's date, it falls
   back to scraping the current rate from tgju.org and upserts a row for
   today directly.

3. Start the built-in PHP web server from the project root:

   ```bash
   php -S 127.0.0.1:8090 -t public
   ```

4. Open <http://127.0.0.1:8090/> in a browser.

## Running Tests

```bash
php tests/run_tests.php
```

Runs the zero-dependency Unit and Integration suites against in-memory SQLite
databases and exits with status `0` on success, `1` on any failure.

## API

All endpoints are served from `public/api/rates.php?action=...`:

* `latest` — most recent recorded observation.
* `series` — chronological series for charts (`from`, `to` optional).
* `lookup` — resolves `date=YYYY-MM-DD` to the nearest preceding trading
  observation when the exact date has no data.
* `compare` — resolves `date_a` and `date_b`, optionally applying:
  * `irr_amount` for the Revaluation workflow, or
  * `price_a` and `price_b` for the Two-Price Comparison workflow.

## Notes

* The dataset has a known coverage gap between `2010-01-01` (end of the
  annual dataset) and `2011-11-26` (start of the daily dataset). The API
  leaves this range unpopulated, and the History Explorer chart renders an
  explicit visual break there instead of a fake interpolated line.
* Third-party assets (Chart.js, flatpickr) are vendored locally under
  `public/assets/vendor/` for offline/local-first use.
* The UI supports English and Farsi, switchable at any time via the
  language control in the header (persisted in `localStorage`). Farsi mode
  switches the page to `dir="rtl"`; numbers are kept in Latin/`en-US`
  formatting in both languages by design.
* Frontend styling follows the "Precision Finance" design system (warm
  terracotta/amber palette, Manrope/Work Sans/JetBrains Mono typography)
  documented in `docs/design/DESIGN.md`. Fonts are referenced by family
  name with system fallbacks only — no external font/CDN requests are made,
  keeping the app fully local-first/offline-capable.
