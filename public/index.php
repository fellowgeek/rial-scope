<?php
declare(strict_types=1);

function asset(string $path): string
{
    $fullPath = __DIR__ . '/' . ltrim($path, '/');
    $version = file_exists($fullPath) ? (string) filemtime($fullPath) : '1';
    return $path . '?v=' . $version;
}
?>
<!DOCTYPE html>
<html lang="en" dir="ltr" id="html-root">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title data-i18n="app_title">Rial Scope</title>
<link rel="stylesheet" href="<?= asset('assets/vendor/flatpickr.min.css') ?>">
<link rel="stylesheet" href="<?= asset('assets/styles.css') ?>">
</head>
<body>
<!--
THESIS: A Jet-Age ticket wallet and Swiss Neo-Brutalist currency ledger that refuses generic flat SaaS cards in favor of high-density perforated flight coupons and official stamped validation registers.
OWN-WORLD: Aviation navy ground (#0f172a), crisp off-white ticket cardstock (#f8fafc), 3px solid ink borders, carbon-copy typography, perforated tear-off tabs, and red/green official ink validation stamps (#dc2626, #16a34a).
STORY: Visitors inspect live exchange rates, select calculation coupons, revalue purchasing power across 75 years, and verify trading-day fallback authenticity.
FIRST VIEWPORT: A multi-coupon ticket wallet with top tab coupons for Revalue Amount, USD Converter, Compare Prices, and History Explorer, today's rate badge, and an ultra-structured calculation matrix.
FORM: Jet-Age Ticket Ledger (vernacular-ephemera-jet-age-ticket-wallet, challenger on seed key 42ea6a27).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->

<div class="ticket-app-wrapper">
    <header class="app-header">
        <div id="today-rate" class="today-rate" aria-live="polite">
            <span class="live-pill"><span class="live-dot"></span> LIVE</span>
            <div class="today-rate-text-group">
                <span class="today-rate-label" data-i18n="today_rate_label">Today's Rate</span>
                <span class="today-rate-value" id="today-rate-value">&hellip;</span>
            </div>
            <span class="today-rate-date" id="today-rate-date"></span>
        </div>

        <div class="app-branding">
            <h1 data-i18n="app_title">Rial Scope</h1>
            <span class="app-tagline">USD / IRR EXCHANGE RATE EXPLORER · HISTORICAL REGISTER</span>
        </div>

        <div class="header-tools">
            <div class="official-seal-badge">
                <span class="seal-serial">REF: IR-USD-75Y</span>
            </div>
            <div class="lang-switcher" role="group" aria-label="Language">
                <button type="button" class="lang-option" id="lang-en" data-lang="en">EN</button>
                <span class="lang-sep" aria-hidden="true">|</span>
                <button type="button" class="lang-option" id="lang-fa" data-lang="fa">FA</button>
            </div>
        </div>
    </header>

    <main class="ticket-booklet">
            <div class="ticket-header-strip">
                <div class="strip-coverage-group">
                    <span class="strip-label" data-i18n="strip_coverage_label">HISTORICAL COVERAGE:</span>
                    <span class="strip-range">1950 &ndash; 2026</span>
                    <span class="strip-duration-badge" data-i18n="strip_duration_badge">75 YEARS</span>
                </div>
                <div class="strip-resolution-tag" data-i18n="strip_resolution_tag">DAILY &amp; ANNUAL DATASETS</div>
            </div>

            <nav class="tabs ticket-tab-deck" role="tablist">
                <button role="tab" aria-selected="true" aria-controls="panel-revalue" data-tab="revalue" class="tab-btn active">
                    <span class="tab-coupon-idx">CPN 01</span>
                    <span class="tab-coupon-title" data-i18n="tab_revalue">Revalue Amount</span>
                </button>
                <button role="tab" aria-selected="false" aria-controls="panel-convert" data-tab="convert" class="tab-btn">
                    <span class="tab-coupon-idx">CPN 02</span>
                    <span class="tab-coupon-title" data-i18n="tab_convert">USD Converter</span>
                </button>
                <button role="tab" aria-selected="false" aria-controls="panel-compare" data-tab="compare" class="tab-btn">
                    <span class="tab-coupon-idx">CPN 03</span>
                    <span class="tab-coupon-title" data-i18n="tab_compare">Compare Item Prices</span>
                </button>
                <button role="tab" aria-selected="false" aria-controls="panel-history" data-tab="history" class="tab-btn">
                    <span class="tab-coupon-idx">CPN 04</span>
                    <span class="tab-coupon-title" data-i18n="tab_history">History Explorer</span>
                </button>
            </nav>

            <div class="ticket-body-container">
                <div class="ticket-notch ticket-notch-left" aria-hidden="true"></div>
                <div class="ticket-notch ticket-notch-right" aria-hidden="true"></div>

                <!-- Workflow 1: Revalue a single IRR amount between two dates -->
                <section id="panel-revalue" class="tab-panel active" role="tabpanel">
                    <div class="panel-heading">
                        <div class="panel-kicker-row">
                            <span class="panel-kicker">COUPON NO. 01 / PURCHASING POWER AUDIT</span>
                        </div>
                        <h2 data-i18n="revalue_heading">Purchasing Power Analysis</h2>
                        <p class="panel-intro" data-i18n="revalue_intro">See how a fixed Rial amount's purchasing power in US Dollars changed between two dates.</p>
                    </div>
                    <div class="calc-card">
                        <form id="revalue-form" class="calc-form" novalidate>
                            <div class="field-grid-ledger">
                                <div class="field field-amount">
                                    <label for="revalue-amount">
                                        <span class="field-code" data-i18n="entry_amount">ENTRY 01</span>
                                        <span data-i18n="label_amount">Amount (IRR)</span>
                                    </label>
                                    <input type="text" id="revalue-amount" class="amount-input" name="amount" inputmode="decimal" placeholder="10,000,000" value="10,000,000" autocomplete="off" required>
                                </div>
                                <div class="date-row">
                                    <div class="field">
                                        <label for="revalue-date-a">
                                            <span class="field-code" data-i18n="dep_date_a">DEP 01</span>
                                            <span data-i18n="label_date_a">Date A</span>
                                        </label>
                                        <input type="text" id="revalue-date-a" class="date-input" name="date_a" placeholder="YYYY-MM-DD" maxlength="10" autocomplete="off" required>
                                    </div>
                                    <div class="field">
                                        <label for="revalue-date-b">
                                            <span class="field-code" data-i18n="arr_date_b">ARR 02</span>
                                            <span data-i18n="label_date_b">Date B</span>
                                        </label>
                                        <input type="text" id="revalue-date-b" class="date-input" name="date_b" placeholder="YYYY-MM-DD" maxlength="10" autocomplete="off" required>
                                    </div>
                                </div>
                            </div>
                            <div class="form-actions-bar">
                                <button type="submit" class="btn-primary" data-i18n="btn_calculate">Calculate</button>
                                <span class="form-action-note" data-i18n="form_action_revalue">PRESS TO EXECUTE RATE CALCULATION</span>
                            </div>
                        </form>
                        <div id="revalue-result" class="result-box" hidden aria-live="polite"></div>
                    </div>
                </section>

                <!-- Workflow 2: USD to IRR Conversion for a single date -->
                <section id="panel-convert" class="tab-panel" role="tabpanel" hidden>
                    <div class="panel-heading">
                        <div class="panel-kicker-row">
                            <span class="panel-kicker">COUPON NO. 02 / DIRECT CONVERSION DISPATCH</span>
                        </div>
                        <h2 data-i18n="convert_heading">USD to IRR Converter</h2>
                        <p class="panel-intro" data-i18n="convert_intro">Convert US Dollars to Iranian Rials based on the exchange rate for a selected date.</p>
                    </div>
                    <div class="calc-card">
                        <form id="convert-form" class="calc-form" novalidate>
                            <div class="date-row">
                                <div class="field">
                                    <label for="convert-amount-usd">
                                        <span class="field-code" data-i18n="src_usd">SRC USD</span>
                                        <span data-i18n="label_amount_usd">Amount (USD)</span>
                                    </label>
                                    <input type="text" id="convert-amount-usd" class="amount-input" name="amount_usd" inputmode="decimal" placeholder="1" value="1" autocomplete="off" required>
                                </div>
                                <div class="field">
                                    <label for="convert-date">
                                        <span class="field-code" data-i18n="val_date">VAL DATE</span>
                                        <span data-i18n="label_date">Date</span>
                                    </label>
                                    <input type="text" id="convert-date" class="date-input" name="date" placeholder="YYYY-MM-DD" maxlength="10" autocomplete="off" required>
                                </div>
                            </div>
                            <div class="form-actions-bar">
                                <button type="submit" class="btn-primary" data-i18n="btn_calculate">Calculate</button>
                                <span class="form-action-note" data-i18n="form_action_convert">EXECUTE CONVERSION MANIFEST</span>
                            </div>
                        </form>
                        <div id="convert-result" class="result-box" hidden aria-live="polite"></div>
                    </div>
                </section>

                <!-- Workflow 3: Compare two independent historical item prices -->
                <section id="panel-compare" class="tab-panel" role="tabpanel" hidden>
                    <div class="panel-heading">
                        <div class="panel-kicker-row">
                            <span class="panel-kicker">COUPON NO. 03 / RELATIVE VALUE MANIFEST</span>
                        </div>
                        <h2 data-i18n="compare_heading">Item Price Comparison</h2>
                        <p class="panel-intro" data-i18n="compare_intro">Compare two historical Rial prices for an item (e.g. a car) to see whether it got cheaper or more expensive in real US Dollar terms.</p>
                    </div>
                    <div class="calc-card">
                        <form id="compare-form" class="calc-form" novalidate>
                            <div class="price-row">
                                <fieldset class="price-group">
                                    <legend>
                                        <span class="legend-code" data-i18n="item_a_code">ITEM 01</span>
                                        <span data-i18n="legend_item_a">Item A</span>
                                    </legend>
                                    <div class="field">
                                        <label for="compare-price-a" data-i18n="label_price">Price (IRR)</label>
                                        <input type="text" id="compare-price-a" class="amount-input" inputmode="decimal" placeholder="0" autocomplete="off" required>
                                    </div>
                                    <div class="field">
                                        <label for="compare-date-a" data-i18n="label_date">Date</label>
                                        <input type="text" id="compare-date-a" class="date-input" placeholder="YYYY-MM-DD" maxlength="10" autocomplete="off" required>
                                    </div>
                                </fieldset>
                                <fieldset class="price-group">
                                    <legend>
                                        <span class="legend-code" data-i18n="item_b_code">ITEM 02</span>
                                        <span data-i18n="legend_item_b">Item B</span>
                                    </legend>
                                    <div class="field">
                                        <label for="compare-price-b" data-i18n="label_price">Price (IRR)</label>
                                        <input type="text" id="compare-price-b" class="amount-input" inputmode="decimal" placeholder="0" autocomplete="off" required>
                                    </div>
                                    <div class="field">
                                        <label for="compare-date-b" data-i18n="label_date">Date</label>
                                        <input type="text" id="compare-date-b" class="date-input" placeholder="YYYY-MM-DD" maxlength="10" autocomplete="off" required>
                                    </div>
                                </fieldset>
                            </div>
                            <div class="form-actions-bar">
                                <button type="submit" class="btn-primary" data-i18n="btn_calculate">Calculate</button>
                                <span class="form-action-note" data-i18n="form_action_compare">COMPARE DUAL-LEG ITEM VALUES</span>
                            </div>
                        </form>
                        <div id="compare-result" class="result-box" hidden aria-live="polite"></div>
                    </div>
                </section>

                <!-- Interactive history explorer & chart -->
                <section id="panel-history" class="tab-panel" role="tabpanel" hidden>
                    <div class="panel-heading">
                        <div class="panel-kicker-row">
                            <span class="panel-kicker">COUPON NO. 04 / 75-YEAR EXCHANGE ROUTE TELEMETRY</span>
                        </div>
                        <h2 data-i18n="history_heading">Historical Rate Explorer</h2>
                        <p class="panel-intro" data-i18n="history_intro">Explore the full USD/IRR rate history from 1950 to today.</p>
                    </div>
                    <div class="calc-card">
                        <div class="history-controls">
                            <div class="field">
                                <label for="history-from">
                                    <span class="field-code" data-i18n="log_from">LOG FROM</span>
                                    <span data-i18n="label_from">From</span>
                                </label>
                                <input type="text" id="history-from" class="date-input" placeholder="YYYY-MM-DD" maxlength="10" autocomplete="off">
                            </div>
                            <div class="field">
                                <label for="history-to">
                                    <span class="field-code" data-i18n="log_to">LOG TO</span>
                                    <span data-i18n="label_to">To</span>
                                </label>
                                <input type="text" id="history-to" class="date-input" placeholder="YYYY-MM-DD" maxlength="10" autocomplete="off">
                            </div>
                            <div class="history-presets" role="group" aria-label="Preset ranges">
                                <button type="button" class="btn-preset active" data-range="ytd" data-i18n="preset_ytd">YTD</button>
                                <button type="button" class="btn-preset" data-range="1y" data-i18n="preset_1y">1Y</button>
                                <button type="button" class="btn-preset" data-range="5y" data-i18n="preset_5y">5Y</button>
                                <button type="button" class="btn-preset" data-range="all" data-i18n="preset_all">All</button>
                            </div>
                            <button id="history-reload" type="button" class="btn-secondary" data-i18n="btn_reload">Reload</button>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="history-chart" aria-label="USD/IRR historical rate chart" role="img"></canvas>
                        </div>
                        <div class="gap-notice-banner">
                            <span class="gap-stamp" data-i18n="gap_stamp">[DISCONTINUITY DISPATCH]</span>
                            <p class="gap-note" data-i18n="gap_note">Note: no data is available between 2010-01-01 and 2011-11-26; the chart shows an explicit break rather than an interpolated line.</p>
                        </div>
                    </div>
                </section>
            </div>
        </main>

    <footer class="app-footer">
        <div class="footer-stamp-box">
            <span class="footer-stamp-title" data-i18n="footer_stamp_title">OFFICIAL OBSERVED DATASET DISPATCH</span>
            <p data-i18n="footer_note">Data spans 1950–2026. When a selected date has no trading data (weekend/holiday), the nearest prior available date is applied automatically.</p>
        </div>
        <p class="footer-github" data-i18n-html="footer_github_html">The datasets and source code are available on <a href="https://github.com/fellowgeek/rial-scope" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>.</p>
    </footer>
</div>

<div id="error-banner" class="error-banner" hidden role="alert"></div>

<script src="<?= asset('assets/vendor/chart.umd.min.js') ?>"></script>
<script src="<?= asset('assets/vendor/flatpickr.min.js') ?>"></script>
<script src="<?= asset('assets/app.js') ?>"></script>
</body>
</html>
