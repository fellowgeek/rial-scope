/**
 * USD-IRR Exchange Explorer — application state, calculations, API & chart integration.
 */
(function () {
    'use strict';

    const API_BASE = 'api/rates.php';
    const STORAGE_LANG_KEY = 'usd-irr:lang';
    // Annual-resolution rows are spaced ~365 days apart; anything wider than that
    // (namely the 2010-01-01 -> 2011-11-26 coverage gap) is drawn as a visible break.
    const GAP_THRESHOLD_DAYS = 400;

    // ---------------------------------------------------------------------
    // i18n
    // ---------------------------------------------------------------------
    const I18N = {
        en: {
            app_title: 'USD-IRR Exchange Explorer',
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
        },
        fa: {
            app_title: 'کاوشگر نرخ دلار به ریال',
            tab_revalue: 'ارزش‌گذاری مبلغ',
            tab_compare: 'مقایسه قیمت کالا',
            tab_history: 'تاریخچه نرخ‌ها',
            revalue_intro: 'ببینید قدرت خرید یک مبلغ ثابت ریالی بر حسب دلار آمریکا بین دو تاریخ چگونه تغییر کرده است.',
            compare_intro: 'دو قیمت تاریخی ریالی یک کالا (مثلاً خودرو) را مقایسه کنید تا ببینید بر حسب دلار واقعی گران‌تر شده یا ارزان‌تر.',
            history_intro: 'تاریخچه کامل نرخ دلار به ریال از سال ۱۹۵۰ تاکنون را بررسی کنید.',
            label_amount: 'مبلغ (ریال)',
            label_date_a: 'تاریخ الف',
            label_date_b: 'تاریخ ب',
            label_price: 'قیمت (ریال)',
            label_date: 'تاریخ',
            label_from: 'از',
            label_to: 'تا',
            legend_item_a: 'کالای الف',
            legend_item_b: 'کالای ب',
            btn_calculate: 'محاسبه',
            btn_reload: 'به‌روزرسانی',
            gap_note: 'توجه: بین تاریخ‌های ۲۰۱۰-۰۱-۰۱ و ۲۰۱۱-۱۱-۲۶ داده‌ای موجود نیست؛ نمودار به‌جای خط درون‌یابی‌شده، شکاف را به‌وضوح نمایش می‌دهد.',
            footer_note: 'داده‌ها از سال ۱۹۵۰ تا ۲۰۲۶ را پوشش می‌دهند. در صورت نبود معامله در تاریخ انتخابی (تعطیل/آخر هفته)، نزدیک‌ترین تاریخ معتبر قبلی به‌کار می‌رود.',
            result_usd_at_a: 'ارزش دلاری در تاریخ الف',
            result_usd_at_b: 'ارزش دلاری در تاریخ ب',
            result_usd_a: 'کالای الف به دلار',
            result_usd_b: 'کالای ب به دلار',
            result_delta_usd: 'اختلاف دلاری',
            result_delta_pct: 'اختلاف درصدی',
            fallback_badge: 'درخواستی {requested} ← اعمال‌شده {applied}',
            error_generic: 'خطایی رخ داد. لطفاً ورودی‌ها را بررسی و دوباره تلاش کنید.',
            error_invalid_amount: 'لطفاً یک مبلغ مثبت معتبر وارد کنید.',
            error_invalid_dates: 'لطفاً تاریخ‌های معتبر انتخاب کنید.',
        },
    };

    const state = {
        lang: localStorage.getItem(STORAGE_LANG_KEY) || 'en',
        maxDate: null,
        minDate: '1950-01-01',
        pickers: [],
        chart: null,
    };

    function t(key) {
        return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
    }

    function format(template, params) {
        return template.replace(/\{(\w+)\}/g, (_, k) => (k in params ? params[k] : `{${k}}`));
    }

    // ---------------------------------------------------------------------
    // Gregorian <-> Jalali conversion (for Persian date display only)
    // ---------------------------------------------------------------------
    function div(a, b) {
        return Math.trunc(a / b);
    }

    function gregorianToJalali(gy, gm, gd) {
        const gDaysInMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        const gy2 = gm > 2 ? gy + 1 : gy;
        let days = 355666 + 365 * gy + div(gy2 + 3, 4) - div(gy2 + 99, 100) + div(gy2 + 399, 400) + gd + gDaysInMonth[gm - 1];
        let jy = -1595 + 33 * div(days, 12053);
        days %= 12053;
        jy += 4 * div(days, 1461);
        days %= 1461;
        if (days > 365) {
            jy += div(days - 1, 365);
            days = (days - 1) % 365;
        }
        let jm, jd;
        if (days < 186) {
            jm = 1 + div(days, 31);
            jd = 1 + (days % 31);
        } else {
            jm = 7 + div(days - 186, 30);
            jd = 1 + ((days - 186) % 30);
        }
        return [jy, jm, jd];
    }

    const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    function toFaDigits(str) {
        return String(str).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
    }

    function formatDateForDisplay(isoDate) {
        if (!isoDate) return '';
        if (state.lang !== 'fa') return isoDate;

        const [y, m, d] = isoDate.split('-').map(Number);
        const [jy, jm, jd] = gregorianToJalali(y, m, d);
        const jalaliStr = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
        return toFaDigits(jalaliStr);
    }

    function formatNumber(value, fractionDigits) {
        const locale = state.lang === 'fa' ? 'fa-IR' : 'en-US';
        return new Intl.NumberFormat(locale, {
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

    function setLanguage(lang) {
        state.lang = lang === 'fa' ? 'fa' : 'en';
        localStorage.setItem(STORAGE_LANG_KEY, state.lang);

        const html = document.getElementById('html-root');
        html.lang = state.lang;
        html.dir = state.lang === 'fa' ? 'rtl' : 'ltr';

        applyTranslations();

        state.pickers.forEach((fp) => {
            fp.set('locale', state.lang === 'fa' ? 'fa' : 'default');
        });

        if (state.chart) {
            renderChart(state.chart.__rawSeries);
        }
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
    // Date pickers
    // ---------------------------------------------------------------------
    function initDatePickers() {
        document.querySelectorAll('.date-input').forEach((input) => {
            const fp = window.flatpickr(input, {
                dateFormat: 'Y-m-d',
                minDate: state.minDate,
                maxDate: state.maxDate || undefined,
                allowInput: true,
                locale: state.lang === 'fa' ? 'fa' : 'default',
            });
            state.pickers.push(fp);
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

    function renderRevalueResult(payload) {
        const box = document.getElementById('revalue-result');
        const { date_a, date_b, revalue } = payload;

        box.innerHTML = `
            <div class="result-row">
                <span class="label">${t('label_date_a')} ${fallbackBadge(date_a)}</span>
                <span class="value">${formatDateForDisplay(date_a.applied_date)}</span>
            </div>
            <div class="result-row">
                <span class="label">${t('label_date_b')} ${fallbackBadge(date_b)}</span>
                <span class="value">${formatDateForDisplay(date_b.applied_date)}</span>
            </div>
            <div class="result-row">
                <span class="label">${t('result_usd_at_a')}</span>
                <span class="value">$${formatNumber(revalue.usd_at_a)}</span>
            </div>
            <div class="result-row">
                <span class="label">${t('result_usd_at_b')}</span>
                <span class="value">$${formatNumber(revalue.usd_at_b)}</span>
            </div>
            <div class="result-row">
                <span class="label">${t('result_delta_usd')}</span>
                <span class="value ${deltaClass(revalue.delta_usd)}">$${formatNumber(revalue.delta_usd)}</span>
            </div>
            <div class="result-row">
                <span class="label">${t('result_delta_pct')}</span>
                <span class="value ${deltaClass(revalue.delta_percent ?? 0)}">${revalue.delta_percent === null ? '—' : formatNumber(revalue.delta_percent) + '%'}</span>
            </div>
        `;
        box.hidden = false;
    }

    function renderCompareResult(payload) {
        const box = document.getElementById('compare-result');
        const { date_a, date_b, compare_items } = payload;

        box.innerHTML = `
            <div class="result-row">
                <span class="label">${t('legend_item_a')} ${fallbackBadge(date_a)}</span>
                <span class="value">${formatDateForDisplay(date_a.applied_date)}</span>
            </div>
            <div class="result-row">
                <span class="label">${t('legend_item_b')} ${fallbackBadge(date_b)}</span>
                <span class="value">${formatDateForDisplay(date_b.applied_date)}</span>
            </div>
            <div class="result-row">
                <span class="label">${t('result_usd_a')}</span>
                <span class="value">$${formatNumber(compare_items.usd_a)}</span>
            </div>
            <div class="result-row">
                <span class="label">${t('result_usd_b')}</span>
                <span class="value">$${formatNumber(compare_items.usd_b)}</span>
            </div>
            <div class="result-row">
                <span class="label">${t('result_delta_usd')}</span>
                <span class="value ${deltaClass(compare_items.delta_usd)}">$${formatNumber(compare_items.delta_usd)}</span>
            </div>
            <div class="result-row">
                <span class="label">${t('result_delta_pct')}</span>
                <span class="value ${deltaClass(compare_items.delta_percent ?? 0)}">${compare_items.delta_percent === null ? '—' : formatNumber(compare_items.delta_percent) + '%'}</span>
            </div>
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

            const amount = parseFloat(document.getElementById('revalue-amount').value);
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
                renderRevalueResult(payload);
            } catch (err) {
                showError(err.message || t('error_generic'));
            }
        });
    }

    function initCompareForm() {
        const form = document.getElementById('compare-form');
        form.addEventListener('submit', async (evt) => {
            evt.preventDefault();

            const priceA = parseFloat(document.getElementById('compare-price-a').value);
            const priceB = parseFloat(document.getElementById('compare-price-b').value);
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
        } catch (err) {
            showError(err.message || t('error_generic'));
        }

        initTabs();
        initDatePickers();
        initRevalueForm();
        initCompareForm();
        initHistoryControls();

        document.getElementById('lang-toggle').addEventListener('click', () => {
            setLanguage(state.lang === 'en' ? 'fa' : 'en');
        });

        setLanguage(state.lang);
        loadHistory();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
