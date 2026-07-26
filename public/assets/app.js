/**
 * USD-IRR Exchange Explorer — application state, calculations, API & chart integration.
 */
(function () {
    'use strict';

    const API_BASE = 'api/rates.php';
    // Annual-resolution rows are spaced ~365 days apart; anything wider than that
    // (namely the 2010-01-01 -> 2011-11-26 coverage gap) is drawn as a visible break.
    const GAP_THRESHOLD_DAYS = 400;

    // ---------------------------------------------------------------------
    // i18n
    // ---------------------------------------------------------------------
    const STRINGS = {
        app_title: 'USD-IRR Exchange Explorer',
        today_rate_label: "Today's Rate",
        tab_revalue: 'Revalue Amount',
        tab_compare: 'Compare Item Prices',
        tab_history: 'History Explorer',
        revalue_intro: "See how a fixed Rial amount's purchasing power in US Dollars changed between two dates.",
        compare_intro: 'Compare two historical Rial prices for an item (e.g. a car) to see whether it got cheaper or more expensive in real US Dollar terms.',
        history_intro: 'Explore the full USD/IRR rate history from 1950 to today.',
        label_amount: 'Amount (IRR)',
        label_date_a: 'Date A',
        label_date_b: 'Date B',
        label_price: 'Price (IRR)',
        label_date: 'Date',
        label_from: 'From',
        label_to: 'To',
        legend_item_a: 'Item A',
        legend_item_b: 'Item B',
        btn_calculate: 'Calculate',
        btn_reload: 'Reload',
        gap_note: 'Note: no data is available between 2010-01-01 and 2011-11-26; the chart shows an explicit break rather than an interpolated line.',
        footer_note: 'Data spans 1950–2026. When a selected date has no trading data (weekend/holiday), the nearest prior available date is applied automatically.',
        result_usd_at_a: 'USD value at Date A',
        result_usd_at_b: 'USD value at Date B',
        result_usd_a: 'Item A in USD',
        result_usd_b: 'Item B in USD',
        result_delta_usd: 'Dollar delta',
        result_delta_pct: 'Percent delta',
        fallback_badge: 'Requested {requested} → Applied {applied}',
        error_generic: 'Something went wrong. Please check your inputs and try again.',
        error_invalid_amount: 'Please enter a valid positive amount.',
        error_invalid_dates: 'Please select valid dates.',
    };

    const state = {
        maxDate: null,
        minDate: '1950-01-01',
        pickers: [],
        chart: null,
    };

    function t(key) {
        return STRINGS[key] || key;
    }

    function format(template, params) {
        return template.replace(/\{(\w+)\}/g, (_, k) => (k in params ? params[k] : `{${k}}`));
    }

    function formatDateForDisplay(isoDate) {
        return isoDate || '';
    }

    function formatNumber(value, fractionDigits) {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: fractionDigits ?? 2,
            minimumFractionDigits: 0,
        }).format(value);
    }

    // ---------------------------------------------------------------------
    // API helpers
    // ---------------------------------------------------------------------
    async function apiGet(params) {
        const url = `${API_BASE}?${new URLSearchParams(params).toString()}`;
        const response = await fetch(url);
        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(body.error || t('error_generic'));
        }

        return body;
    }

    function showError(message) {
        const banner = document.getElementById('error-banner');
        banner.textContent = message;
        banner.hidden = false;
        clearTimeout(showError._timer);
        showError._timer = setTimeout(() => {
            banner.hidden = true;
        }, 5000);
    }

    // ---------------------------------------------------------------------
    // i18n application
    // ---------------------------------------------------------------------
    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            el.textContent = t(el.dataset.i18n);
        });
    }

    function renderTodayRate(latest) {
        const valueEl = document.getElementById('today-rate-value');
        const dateEl = document.getElementById('today-rate-date');
        if (!valueEl || !dateEl || !latest) return;

        valueEl.textContent = `${formatNumber(latest.rate_irr_per_usd)} IRR`;
        dateEl.textContent = `as of ${latest.date}`;
    }

    // ---------------------------------------------------------------------
    // Tabs
    // ---------------------------------------------------------------------
    function initTabs() {
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                buttons.forEach((b) => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');

                document.querySelectorAll('.tab-panel').forEach((panel) => {
                    panel.hidden = panel.id !== `panel-${btn.dataset.tab}`;
                });

                if (btn.dataset.tab === 'history' && state.chart) {
                    state.chart.resize();
                }
            });
        });
    }

    // ---------------------------------------------------------------------
    // Input masks
    // ---------------------------------------------------------------------
    function countDigits(str) {
        return (str.match(/\d/g) || []).length;
    }

    // Repositions the caret after a mask reformats the value, keeping it after
    // the same number of digits the user had typed past rather than jumping
    // to the end of the field.
    function restoreCaretByDigitCount(input, digitsBeforeCaret) {
        let pos = 0;
        let seen = 0;
        while (pos < input.value.length && seen < digitsBeforeCaret) {
            if (/\d/.test(input.value[pos])) seen++;
            pos++;
        }
        input.setSelectionRange(pos, pos);
    }

    function formatAmountValue(raw) {
        let cleaned = raw.replace(/[^\d.]/g, '');
        const firstDot = cleaned.indexOf('.');
        if (firstDot !== -1) {
            cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
        }
        const [intPartRaw, decPart] = cleaned.split('.');
        const intPart = intPartRaw.replace(/^0+(?=\d)/, '');
        const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (decPart === undefined) {
            return cleaned.endsWith('.') ? `${grouped}.` : grouped;
        }
        return `${grouped}.${decPart}`;
    }

    // Formats an amount input with thousands separators (comma every 3 digits)
    // as the user types, while preserving caret position.
    function attachAmountMask(input) {
        input.addEventListener('input', () => {
            const cursorPos = input.selectionStart ?? input.value.length;
            const digitsBeforeCursor = countDigits(input.value.slice(0, cursorPos));
            input.value = formatAmountValue(input.value);
            restoreCaretByDigitCount(input, digitsBeforeCursor);
        });
    }

    // Strips thousands separators and parses an amount input's value as a number.
    function parseAmountValue(input) {
        return parseFloat(input.value.replace(/,/g, ''));
    }

    function formatDateValue(raw) {
        const digits = raw.replace(/\D/g, '').slice(0, 8);
        let out = digits.slice(0, 4);
        if (digits.length > 4) out += `-${digits.slice(4, 6)}`;
        if (digits.length > 6) out += `-${digits.slice(6, 8)}`;
        return out;
    }

    // Auto-inserts dashes into a date input as the user types digits, producing
    // a YYYY-MM-DD mask while preserving caret position.
    function attachDateMask(input) {
        input.addEventListener('input', () => {
            const cursorPos = input.selectionStart ?? input.value.length;
            const digitsBeforeCursor = countDigits(input.value.slice(0, cursorPos));
            input.value = formatDateValue(input.value);
            restoreCaretByDigitCount(input, digitsBeforeCursor);
        });
    }

    // ---------------------------------------------------------------------
    // Date pickers
    // ---------------------------------------------------------------------
    function initDatePickers() {
        document.querySelectorAll('.date-input').forEach((input) => {
            attachDateMask(input);
            const fp = window.flatpickr(input, {
                dateFormat: 'Y-m-d',
                minDate: state.minDate,
                maxDate: state.maxDate || undefined,
                allowInput: true,
            });
            state.pickers.push(fp);
        });
    }

    function initAmountMasks() {
        document.querySelectorAll('.amount-input').forEach((input) => {
            attachAmountMask(input);
        });
    }

    // ---------------------------------------------------------------------
    // Result rendering
    // ---------------------------------------------------------------------
    function fallbackBadge(resolution) {
        if (resolution.exact_match) return '';
        return `<span class="badge-fallback">${format(t('fallback_badge'), {
            requested: formatDateForDisplay(resolution.requested_date),
            applied: formatDateForDisplay(resolution.applied_date),
        })}</span>`;
    }

    function deltaClass(value) {
        if (value > 0) return 'positive';
        if (value < 0) return 'negative';
        return '';
    }

    function deltaIcon(value) {
        if (value > 0) return '▲';
        if (value < 0) return '▼';
        return '—';
    }

    function pctPhrase(deltaPercent) {
        return deltaPercent === null ? '' : ` (${formatNumber(Math.abs(deltaPercent))}%)`;
    }

    function buildRevalueSummary(amount, dateA, dateB, revalue) {
        const amountText = formatNumber(amount, 0);
        const magnitude = `$${formatNumber(Math.abs(revalue.delta_usd))}${pctPhrase(revalue.delta_percent)}`;

        if (revalue.delta_usd > 0) {
            return `${amountText} IRR bought $${formatNumber(revalue.usd_at_a)} on ${formatDateForDisplay(dateA.applied_date)} but bought $${formatNumber(revalue.usd_at_b)} on ${formatDateForDisplay(dateB.applied_date)} — a gain of ${magnitude} in USD terms, meaning the Rial strengthened against the US Dollar over this period.`;
        }
        if (revalue.delta_usd < 0) {
            return `${amountText} IRR bought $${formatNumber(revalue.usd_at_a)} on ${formatDateForDisplay(dateA.applied_date)} but only buys $${formatNumber(revalue.usd_at_b)} on ${formatDateForDisplay(dateB.applied_date)} — a loss of ${magnitude} in USD terms, meaning the Rial weakened against the US Dollar over this period.`;
        }
        return `${amountText} IRR was worth $${formatNumber(revalue.usd_at_a)} on both ${formatDateForDisplay(dateA.applied_date)} and ${formatDateForDisplay(dateB.applied_date)} — its USD purchasing power did not change over this period.`;
    }

    function buildCompareSummary(dateA, dateB, compareItems) {
        const magnitude = `$${formatNumber(Math.abs(compareItems.delta_usd))}${pctPhrase(compareItems.delta_percent)}`;

        if (compareItems.delta_usd > 0) {
            return `Item A cost $${formatNumber(compareItems.usd_a)} on ${formatDateForDisplay(dateA.applied_date)}, while Item B cost $${formatNumber(compareItems.usd_b)} on ${formatDateForDisplay(dateB.applied_date)} — Item B is ${magnitude} more expensive in real US Dollar terms.`;
        }
        if (compareItems.delta_usd < 0) {
            return `Item A cost $${formatNumber(compareItems.usd_a)} on ${formatDateForDisplay(dateA.applied_date)}, while Item B cost $${formatNumber(compareItems.usd_b)} on ${formatDateForDisplay(dateB.applied_date)} — Item B is ${magnitude} cheaper in real US Dollar terms.`;
        }
        return `Both items cost the same, $${formatNumber(compareItems.usd_a)}, in real US Dollar terms despite the different Rial prices and dates.`;
    }

    function renderRevalueResult(payload, amount) {
        const box = document.getElementById('revalue-result');
        const { date_a, date_b, revalue } = payload;
        const pctClass = deltaClass(revalue.delta_percent ?? 0);
        const pctText = revalue.delta_percent === null ? '—' : `${formatNumber(revalue.delta_percent)}%`;

        box.innerHTML = `
            <div class="result-cards">
                <div class="result-card">
                    <span class="result-card-label">${t('label_date_a')}</span>
                    <span class="result-card-date">${formatDateForDisplay(date_a.applied_date)}</span>
                    ${fallbackBadge(date_a)}
                    <span class="result-card-value">$${formatNumber(revalue.usd_at_a)}</span>
                    <span class="result-card-caption">${t('result_usd_at_a')}</span>
                </div>
                <div class="result-card">
                    <span class="result-card-label">${t('label_date_b')}</span>
                    <span class="result-card-date">${formatDateForDisplay(date_b.applied_date)}</span>
                    ${fallbackBadge(date_b)}
                    <span class="result-card-value">$${formatNumber(revalue.usd_at_b)}</span>
                    <span class="result-card-caption">${t('result_usd_at_b')}</span>
                </div>
                <div class="result-card result-card--delta ${pctClass}">
                    <span class="result-card-label">${t('result_delta_usd')}</span>
                    <span class="result-card-value large ${deltaClass(revalue.delta_usd)}">${deltaIcon(revalue.delta_usd)} $${formatNumber(Math.abs(revalue.delta_usd))}</span>
                    <span class="result-card-caption">${t('result_delta_pct')}: ${pctText}</span>
                </div>
            </div>
            <p class="result-summary">${buildRevalueSummary(amount, date_a, date_b, revalue)}</p>
        `;
        box.hidden = false;
    }

    function renderCompareResult(payload) {
        const box = document.getElementById('compare-result');
        const { date_a, date_b, compare_items } = payload;
        const pctClass = deltaClass(compare_items.delta_percent ?? 0);
        const pctText = compare_items.delta_percent === null ? '—' : `${formatNumber(compare_items.delta_percent)}%`;

        box.innerHTML = `
            <div class="result-cards">
                <div class="result-card">
                    <span class="result-card-label">${t('legend_item_a')}</span>
                    <span class="result-card-date">${formatDateForDisplay(date_a.applied_date)}</span>
                    ${fallbackBadge(date_a)}
                    <span class="result-card-value">$${formatNumber(compare_items.usd_a)}</span>
                    <span class="result-card-caption">${t('result_usd_a')}</span>
                </div>
                <div class="result-card">
                    <span class="result-card-label">${t('legend_item_b')}</span>
                    <span class="result-card-date">${formatDateForDisplay(date_b.applied_date)}</span>
                    ${fallbackBadge(date_b)}
                    <span class="result-card-value">$${formatNumber(compare_items.usd_b)}</span>
                    <span class="result-card-caption">${t('result_usd_b')}</span>
                </div>
                <div class="result-card result-card--delta ${pctClass}">
                    <span class="result-card-label">${t('result_delta_usd')}</span>
                    <span class="result-card-value large ${deltaClass(compare_items.delta_usd)}">${deltaIcon(compare_items.delta_usd)} $${formatNumber(Math.abs(compare_items.delta_usd))}</span>
                    <span class="result-card-caption">${t('result_delta_pct')}: ${pctText}</span>
                </div>
            </div>
            <p class="result-summary">${buildCompareSummary(date_a, date_b, compare_items)}</p>
        `;
        box.hidden = false;
    }

    // ---------------------------------------------------------------------
    // Forms
    // ---------------------------------------------------------------------
    function initRevalueForm() {
        const form = document.getElementById('revalue-form');
        form.addEventListener('submit', async (evt) => {
            evt.preventDefault();

            const amount = parseAmountValue(document.getElementById('revalue-amount'));
            const dateA = document.getElementById('revalue-date-a').value;
            const dateB = document.getElementById('revalue-date-b').value;

            if (!Number.isFinite(amount) || amount <= 0) {
                showError(t('error_invalid_amount'));
                return;
            }
            if (!dateA || !dateB) {
                showError(t('error_invalid_dates'));
                return;
            }

            try {
                const payload = await apiGet({
                    action: 'compare',
                    date_a: dateA,
                    date_b: dateB,
                    irr_amount: String(amount),
                });
                renderRevalueResult(payload, amount);
            } catch (err) {
                showError(err.message || t('error_generic'));
            }
        });
    }

    function initCompareForm() {
        const form = document.getElementById('compare-form');
        form.addEventListener('submit', async (evt) => {
            evt.preventDefault();

            const priceA = parseAmountValue(document.getElementById('compare-price-a'));
            const priceB = parseAmountValue(document.getElementById('compare-price-b'));
            const dateA = document.getElementById('compare-date-a').value;
            const dateB = document.getElementById('compare-date-b').value;

            if (!Number.isFinite(priceA) || priceA <= 0 || !Number.isFinite(priceB) || priceB <= 0) {
                showError(t('error_invalid_amount'));
                return;
            }
            if (!dateA || !dateB) {
                showError(t('error_invalid_dates'));
                return;
            }

            try {
                const payload = await apiGet({
                    action: 'compare',
                    date_a: dateA,
                    date_b: dateB,
                    price_a: String(priceA),
                    price_b: String(priceB),
                });
                renderCompareResult(payload);
            } catch (err) {
                showError(err.message || t('error_generic'));
            }
        });
    }

    // ---------------------------------------------------------------------
    // Chart / History explorer
    // ---------------------------------------------------------------------
    function daysBetween(isoA, isoB) {
        const a = new Date(isoA + 'T00:00:00Z').getTime();
        const b = new Date(isoB + 'T00:00:00Z').getTime();
        return Math.abs(b - a) / 86400000;
    }

    function buildChartPoints(series) {
        const labels = [];
        const data = [];

        for (let i = 0; i < series.length; i++) {
            const point = series[i];
            labels.push(point.date);
            data.push(point.rate_irr_per_usd);

            if (i < series.length - 1) {
                const next = series[i + 1];
                if (daysBetween(point.date, next.date) > GAP_THRESHOLD_DAYS) {
                    // Insert a synthetic null point so Chart.js renders a visible break
                    // instead of interpolating a fake line across the missing range.
                    labels.push(`${point.date} .. ${next.date}`);
                    data.push(null);
                }
            }
        }

        return { labels, data };
    }

    function renderChart(series) {
        const ctx = document.getElementById('history-chart').getContext('2d');
        const { labels, data } = buildChartPoints(series);

        if (state.chart) {
            state.chart.destroy();
        }

        state.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'IRR per USD',
                        data,
                        borderColor: '#1f6feb',
                        backgroundColor: 'rgba(31, 111, 235, 0.1)',
                        spanGaps: false,
                        pointRadius: 0,
                        borderWidth: 1.5,
                        tension: 0.1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: { maxTicksLimit: 10, autoSkip: true },
                    },
                    y: {
                        type: 'logarithmic',
                        title: { display: true, text: 'IRR per USD (log scale)' },
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (item) => (item.raw === null ? 'No data' : `${formatNumber(item.raw)} IRR/USD`),
                        },
                    },
                },
                onClick: (evt, elements) => {
                    if (!elements.length) return;
                    const index = elements[0].index;
                    const label = labels[index];
                    if (label && /^\d{4}-\d{2}-\d{2}$/.test(label)) {
                        document.getElementById('history-from').value = label;
                    }
                },
            },
        });
        state.chart.__rawSeries = series;
    }

    async function loadHistory(from, to) {
        try {
            const payload = await apiGet({
                action: 'series',
                ...(from ? { from } : {}),
                ...(to ? { to } : {}),
            });
            renderChart(payload.series);
        } catch (err) {
            showError(err.message || t('error_generic'));
        }
    }

    function initHistoryControls() {
        document.getElementById('history-reload').addEventListener('click', () => {
            const from = document.getElementById('history-from').value || undefined;
            const to = document.getElementById('history-to').value || undefined;
            loadHistory(from, to);
        });
    }

    // ---------------------------------------------------------------------
    // Bootstrap
    // ---------------------------------------------------------------------
    async function init() {
        try {
            const latest = await apiGet({ action: 'latest' });
            state.maxDate = latest.date;
            renderTodayRate(latest);
        } catch (err) {
            showError(err.message || t('error_generic'));
        }

        initTabs();
        initDatePickers();
        initAmountMasks();
        initRevalueForm();
        initCompareForm();
        initHistoryControls();

        applyTranslations();
        loadHistory();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
