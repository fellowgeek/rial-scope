<!DOCTYPE html>
<html lang="en" dir="ltr" id="html-root">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title data-i18n="app_title">Rial Scope</title>
<link rel="stylesheet" href="assets/vendor/flatpickr.min.css">
<link rel="stylesheet" href="assets/styles.css">
</head>
<body>
<header class="app-header">
    <div id="today-rate" class="today-rate" aria-live="polite">
        <span class="today-rate-label" data-i18n="today_rate_label">Today's Rate</span>
        <span class="today-rate-value" id="today-rate-value">&hellip;</span>
        <span class="today-rate-date" id="today-rate-date"></span>
    </div>
    <h1 data-i18n="app_title">Rial Scope</h1>
    <div class="lang-switcher" role="group" aria-label="Language">
        <button type="button" class="lang-option" id="lang-en" data-lang="en">EN</button>
        <span class="lang-sep" aria-hidden="true">/</span>
        <button type="button" class="lang-option" id="lang-fa" data-lang="fa">FA</button>
    </div>
</header>

<main>
    <nav class="tabs" role="tablist">
        <button role="tab" aria-selected="true" aria-controls="panel-revalue" data-tab="revalue" class="tab-btn active" data-i18n="tab_revalue">Revalue Amount</button>
        <button role="tab" aria-selected="false" aria-controls="panel-compare" data-tab="compare" class="tab-btn" data-i18n="tab_compare">Compare Item Prices</button>
        <button role="tab" aria-selected="false" aria-controls="panel-history" data-tab="history" class="tab-btn" data-i18n="tab_history">History Explorer</button>
    </nav>

    <!-- Workflow 1: Revalue a single IRR amount between two dates -->
    <section id="panel-revalue" class="tab-panel active" role="tabpanel">
        <p class="panel-intro" data-i18n="revalue_intro">See how a fixed Rial amount's purchasing power in US Dollars changed between two dates.</p>
        <form id="revalue-form" class="calc-form" novalidate>
            <div class="field">
                <label for="revalue-amount" data-i18n="label_amount">Amount (IRR)</label>
                <input type="text" id="revalue-amount" class="amount-input" name="amount" inputmode="decimal" placeholder="0" autocomplete="off" required>
            </div>
            <div class="date-row">
                <div class="field">
                    <label for="revalue-date-a" data-i18n="label_date_a">Date A</label>
                    <input type="text" id="revalue-date-a" class="date-input" name="date_a" placeholder="YYYY-MM-DD" maxlength="10" autocomplete="off" required>
                </div>
                <div class="field">
                    <label for="revalue-date-b" data-i18n="label_date_b">Date B</label>
                    <input type="text" id="revalue-date-b" class="date-input" name="date_b" placeholder="YYYY-MM-DD" maxlength="10" autocomplete="off" required>
                </div>
            </div>
            <button type="submit" class="btn-primary" data-i18n="btn_calculate">Calculate</button>
        </form>
        <div id="revalue-result" class="result-box" hidden aria-live="polite"></div>
    </section>

    <!-- Workflow 2: Compare two independent historical item prices -->
    <section id="panel-compare" class="tab-panel" role="tabpanel" hidden>
        <p class="panel-intro" data-i18n="compare_intro">Compare two historical Rial prices for an item (e.g. a car) to see whether it got cheaper or more expensive in real US Dollar terms.</p>
        <form id="compare-form" class="calc-form" novalidate>
            <div class="price-row">
                <fieldset class="price-group">
                    <legend data-i18n="legend_item_a">Item A</legend>
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
                    <legend data-i18n="legend_item_b">Item B</legend>
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
            <button type="submit" class="btn-primary" data-i18n="btn_calculate">Calculate</button>
        </form>
        <div id="compare-result" class="result-box" hidden aria-live="polite"></div>
    </section>

    <!-- Interactive history explorer & chart -->
    <section id="panel-history" class="tab-panel" role="tabpanel" hidden>
        <p class="panel-intro" data-i18n="history_intro">Explore the full USD/IRR rate history from 1950 to today.</p>
        <div class="history-controls">
            <div class="field">
                <label for="history-from" data-i18n="label_from">From</label>
                <input type="text" id="history-from" class="date-input" placeholder="YYYY-MM-DD" maxlength="10" autocomplete="off">
            </div>
            <div class="field">
                <label for="history-to" data-i18n="label_to">To</label>
                <input type="text" id="history-to" class="date-input" placeholder="YYYY-MM-DD" maxlength="10" autocomplete="off">
            </div>
            <button id="history-reload" type="button" class="btn-secondary" data-i18n="btn_reload">Reload</button>
        </div>
        <div class="chart-wrapper">
            <canvas id="history-chart" height="120" aria-label="USD/IRR historical rate chart" role="img"></canvas>
        </div>
        <p class="gap-note" data-i18n="gap_note">Note: no data is available between 2010-01-01 and 2011-11-26; the chart shows an explicit break rather than an interpolated line.</p>
    </section>
</main>

<footer class="app-footer">
    <p data-i18n="footer_note">Data spans 1950–2026. When a selected date has no trading data (weekend/holiday), the nearest prior available date is applied automatically.</p>
</footer>

<div id="error-banner" class="error-banner" hidden role="alert"></div>

<script src="assets/vendor/chart.umd.min.js"></script>
<script src="assets/vendor/flatpickr.min.js"></script>
<script src="assets/app.js"></script>
</body>
</html>
