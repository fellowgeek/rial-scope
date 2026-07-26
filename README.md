# USD-IRR Exchange Explorer

A local-first web application for exploring, converting, and evaluating
purchasing-power changes between the US Dollar (USD) and Iranian Rial (IRR)
using historical daily (2011–2026) and annual (1950–2010) exchange rate
datasets.

## Requirements

* PHP 8.x with the `pdo_sqlite` extension (no Composer dependencies).

## Setup

1. Import the CSV datasets into the local SQLite database (`data/rates.db`,
   git-ignored, created automatically):

   ```bash
   php bin/import_rates.php
   ```

   This is idempotent — re-running it upserts rows without creating
   duplicates. A successful run reports 3,969 total rows (61 annual + 3,908
   daily).

2. (Optional) Refresh `docs/current.csv` with the latest daily rates and
   re-import it in one step:

   ```bash
   php bin/update_current_csv.php
   ```

   This downloads the latest CSV from the
   [kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset](https://github.com/kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset)
   repository, overwrites `docs/current.csv`, and re-runs the same import
   logic as `bin/import_rates.php`.

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
