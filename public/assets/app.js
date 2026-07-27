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
    const LANG_STORAGE_KEY = 'usd-irr-lang';

    const I18N = {
        en: {
            app_title: 'USD-IRR Exchange Explorer',
            today_rate_label: "Today's Rate",
            today_rate_as_of: 'as of {date}',
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
            summary_revalue_gain: '{amount} IRR bought ${usdA} on {dateA} but bought ${usdB} on {dateB} — a gain of {magnitude} in USD terms, meaning the Rial strengthened against the US Dollar over this period.',
            summary_revalue_loss: '{amount} IRR bought ${usdA} on {dateA} but only buys ${usdB} on {dateB} — a loss of {magnitude} in USD terms, meaning the Rial weakened against the US Dollar over this period.',
            summary_revalue_same: '{amount} IRR was worth ${usdA} on both {dateA} and {dateB} — its USD purchasing power did not change over this period.',
            summary_compare_more: 'Item A cost ${usdA} on {dateA}, while Item B cost ${usdB} on {dateB} — Item B is {magnitude} more expensive in real US Dollar terms.',
            summary_compare_less: 'Item A cost ${usdA} on {dateA}, while Item B cost ${usdB} on {dateB} — Item B is {magnitude} cheaper in real US Dollar terms.',
            summary_compare_same: 'Both items cost the same, ${usdA}, in real US Dollar terms despite the different Rial prices and dates.',
        },
        fa: {
            app_title: 'کاوشگر نرخ ارز دلار به ریال',
            today_rate_label: 'نرخ امروز',
            today_rate_as_of: 'در تاریخ {date}',
            tab_revalue: 'ارزش‌گذاری مبلغ',
            tab_compare: 'مقایسه قیمت اقلام',
            tab_history: 'کاوش تاریخچه',
            revalue_intro: 'ببینید قدرت خرید یک مبلغ ثابت ریالی بر حسب دلار آمریکا بین دو تاریخ چگونه تغییر کرده است.',
            compare_intro: 'دو قیمت تاریخی ریالی یک کالا (مثلاً خودرو) را مقایسه کنید تا ببینید بر حسب دلار واقعی ارزان‌تر شده یا گران‌تر.',
            history_intro: 'تاریخچه کامل نرخ دلار به ریال از سال ۱۹۵۰ تا امروز را کاوش کنید.',
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
            btn_reload: 'بارگذاری مجدد',
            gap_note: 'توجه: هیچ داده‌ای بین تاریخ‌های ۲۰۱۰-۰۱-۰۱ و ۲۰۱۱-۱۱-۲۶ موجود نیست؛ نمودار به‌جای درون‌یابی، یک شکاف آشکار نمایش می‌دهد.',
            footer_note: 'داده‌ها از سال ۱۹۵۰ تا ۲۰۲۶ را در بر می‌گیرد. هنگامی که تاریخ انتخابی داده معاملاتی نداشته باشد (تعطیلات/آخر هفته)، نزدیک‌ترین تاریخ قبلی موجود به‌طور خودکار اعمال می‌شود.',
            result_usd_at_a: 'ارزش دلاری در تاریخ الف',
            result_usd_at_b: 'ارزش دلاری در تاریخ ب',
            result_usd_a: 'کالای الف به دلار',
            result_usd_b: 'کالای ب به دلار',
            result_delta_usd: 'اختلاف دلاری',
            result_delta_pct: 'اختلاف درصدی',
            fallback_badge: 'درخواستی {requested} ← اعمال‌شده {applied}',
            error_generic: 'مشکلی پیش آمد. لطفاً ورودی‌ها را بررسی کرده و دوباره تلاش کنید.',
            error_invalid_amount: 'لطفاً یک مبلغ مثبت معتبر وارد کنید.',
            error_invalid_dates: 'لطفاً تاریخ‌های معتبر انتخاب کنید.',
            summary_revalue_gain: '{amount} ریال در تاریخ {dateA} معادل {usdA}$ بود، اما در تاریخ {dateB} معادل {usdB}$ شد — سودی معادل {magnitude} از نظر ارزش دلاری، یعنی ریال در این بازه در برابر دلار آمریکا تقویت شده است.',
            summary_revalue_loss: '{amount} ریال در تاریخ {dateA} معادل {usdA}$ بود، اما در تاریخ {dateB} تنها معادل {usdB}$ می‌شود — زیانی معادل {magnitude} از نظر ارزش دلاری، یعنی ریال در این بازه در برابر دلار آمریکا تضعیف شده است.',
            summary_revalue_same: '{amount} ریال هم در تاریخ {dateA} و هم در تاریخ {dateB} معادل {usdA}$ بود — قدرت خرید دلاری آن در این بازه تغییری نکرده است.',
            summary_compare_more: 'کالای الف در تاریخ {dateA} معادل {usdA}$ بود، در حالی‌که کالای ب در تاریخ {dateB} معادل {usdB}$ بود — کالای ب از نظر ارزش واقعی دلاری {magnitude} گران‌تر است.',
            summary_compare_less: 'کالای الف در تاریخ {dateA} معادل {usdA}$ بود، در حالی‌که کالای ب در تاریخ {dateB} معادل {usdB}$ بود — کالای ب از نظر ارزش واقعی دلاری {magnitude} ارزان‌تر است.',
            summary_compare_same: 'هر دو کالا از نظر ارزش واقعی دلاری برابر بودند، {usdA}$، با وجود قیمت‌ها و تاریخ‌های ریالی متفاوت.',
        },
    };

    function loadStoredLang() {
        try {
            const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
            return stored === 'fa' ? 'fa' : 'en';
        } catch (err) {
            return 'en';
        }
    }

    const state = {
        maxDate: null,
        minDate: '1950-01-01',
        pickers: [],
        chart: null,
        lang: loadStoredLang(),
        latestRate: null,
        lastRevalue: null,
        lastCompare: null,
    };

    function t(key) {
        const dict = I18N[state.lang] || I18N.en;
        return dict[key] || I18N.en[key] || key;
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

        const html = document.getElementById('html-root');
        if (html) {
            html.lang = state.lang;
            html.dir = state.lang === 'fa' ? 'rtl' : 'ltr';
        }

        document.querySelectorAll('.lang-option').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.lang === state.lang);
        });
    }

    function setLanguage(lang) {
        const next = lang === 'fa' ? 'fa' : 'en';
        if (next === state.lang) return;
        state.lang = next;
        try {
            window.localStorage.setItem(LANG_STORAGE_KEY, state.lang);
        } catch (err) {
            // localStorage unavailable (e.g. privacy mode) — language just won't persist.
        }

        applyTranslations();
        renderTodayRate(state.latestRate);

        if (state.lastRevalue) {
            renderRevalueResult(state.lastRevalue.payload, state.lastRevalue.amount);
        }
        if (state.lastCompare) {
            renderCompareResult(state.lastCompare.payload);
        }
    }

    function initLanguageToggle() {
        document.querySelectorAll('.lang-option').forEach((btn) => {
            btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
        });
    }

    function renderTodayRate(latest) {
        const valueEl = document.getElementById('today-rate-value');
        const dateEl = document.getElementById('today-rate-date');
        if (!valueEl || !dateEl || !latest) return;

        state.latestRate = latest;
        valueEl.textContent = `${formatNumber(latest.rate_irr_per_usd)} IRR`;
        dateEl.textContent = format(t('today_rate_as_of'), { date: latest.date });
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
    // History explorer's From/To fields intentionally default to empty so the
    // initial chart shows the full 1950-today range rather than a single day.
    const HISTORY_RANGE_INPUT_IDS = new Set(['history-from', 'history-to']);

    function initDatePickers() {
        document.querySelectorAll('.date-input').forEach((input) => {
            attachDateMask(input);
            const isHistoryRangeInput = HISTORY_RANGE_INPUT_IDS.has(input.id);
            const fp = window.flatpickr(input, {
                dateFormat: 'Y-m-d',
                minDate: state.minDate,
                maxDate: state.maxDate || undefined,
                defaultDate: isHistoryRangeInput ? undefined : (state.maxDate || undefined),
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
        const params = {
            amount: formatNumber(amount, 0),
            usdA: formatNumber(revalue.usd_at_a),
            usdB: formatNumber(revalue.usd_at_b),
            dateA: formatDateForDisplay(dateA.applied_date),
            dateB: formatDateForDisplay(dateB.applied_date),
            magnitude: `$${formatNumber(Math.abs(revalue.delta_usd))}${pctPhrase(revalue.delta_percent)}`,
        };

        if (revalue.delta_usd > 0) {
            return format(t('summary_revalue_gain'), params);
        }
        if (revalue.delta_usd < 0) {
            return format(t('summary_revalue_loss'), params);
        }
        return format(t('summary_revalue_same'), params);
    }

    function buildCompareSummary(dateA, dateB, compareItems) {
        const params = {
            usdA: formatNumber(compareItems.usd_a),
            usdB: formatNumber(compareItems.usd_b),
            dateA: formatDateForDisplay(dateA.applied_date),
            dateB: formatDateForDisplay(dateB.applied_date),
            magnitude: `$${formatNumber(Math.abs(compareItems.delta_usd))}${pctPhrase(compareItems.delta_percent)}`,
        };

        if (compareItems.delta_usd > 0) {
            return format(t('summary_compare_more'), params);
        }
        if (compareItems.delta_usd < 0) {
            return format(t('summary_compare_less'), params);
        }
        return format(t('summary_compare_same'), params);
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
        state.lastRevalue = { payload, amount };
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
        state.lastCompare = { payload };
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
        applyTranslations();
        initLanguageToggle();

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
