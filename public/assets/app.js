/**
 * Rial Scope — application state, calculations, API & chart integration.
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
            app_title: 'Rial Scope',
            today_rate_label: "Today's Rate",
            today_rate_as_of: 'as of {date}',
            tab_revalue: 'Revalue Amount',
            tab_compare: 'Compare Item Prices',
            tab_history: 'History Explorer',
            revalue_heading: 'Purchasing Power Analysis',
            revalue_intro: "See how a fixed Rial amount's purchasing power in US Dollars changed between two dates.",
            compare_heading: 'Item Price Comparison',
            compare_intro: 'Compare two historical Rial prices for an item (e.g. a car) to see whether it got cheaper or more expensive in real US Dollar terms.',
            history_heading: 'Historical Rate Explorer',
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
            footer_github_html: 'The datasets and source code are available on <a href="https://github.com/fellowgeek/rial-scope" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>.',
            result_usd_at_a: 'USD value at Date A',
            result_usd_at_b: 'USD value at Date B',
            result_usd_a: 'Item A in USD',
            result_usd_b: 'Item B in USD',
            result_delta_usd: 'Dollar delta',
            result_delta_pct: 'Percent delta',
            result_rial_loss: 'Rial value change',
            result_rate_change: 'USD rate change',
            result_item_price_delta: 'Item price delta (USD)',
            chip_gain: 'Gain',
            chip_loss: 'Loss',
            fallback_badge: 'Requested {requested} → Applied {applied}',
            error_generic: 'Something went wrong. Please check your inputs and try again.',
            error_invalid_amount: 'Please enter a valid positive amount.',
            error_invalid_dates: 'Please select valid dates.',
            summary_revalue_gain: '{amount} bought ${usdA} on {dateA} but bought ${usdB} on {dateB} — a gain of {magnitude} in USD terms, meaning the Rial strengthened by {rialLoss} against the US Dollar ({rateChange} rate change) over this period.',
            summary_revalue_loss: '{amount} bought ${usdA} on {dateA} but only buys ${usdB} on {dateB} — a loss of {magnitude} in USD terms, meaning the Rial lost {rialLoss} of its purchasing power against the US Dollar ({rateChange} rate change) over this period.',
            summary_revalue_same: '{amount} was worth ${usdA} on both {dateA} and {dateB} — its USD purchasing power did not change over this period.',
            summary_compare_more: 'Item A cost ${usdA} on {dateA}, while Item B cost ${usdB} on {dateB} — Item B is {magnitude} more expensive in real US Dollar terms. Over this period, the Rial value changed by {rialLoss} ({rateChange} rate change).',
            summary_compare_less: 'Item A cost ${usdA} on {dateA}, while Item B cost ${usdB} on {dateB} — Item B is {magnitude} cheaper in real US Dollar terms. Over this period, the Rial value changed by {rialLoss} ({rateChange} rate change).',
            summary_compare_same: 'Both items cost the same, ${usdA}, in real US Dollar terms despite the different Rial prices and dates. Over this period, the Rial value changed by {rialLoss} ({rateChange} rate change).',
            tab_convert: 'USD Converter',
            convert_heading: 'USD to IRR Converter',
            convert_intro: 'Convert US Dollars to Iranian Rials based on the exchange rate for a selected date.',
            label_amount_usd: 'Amount (USD)',
            result_converted_irr: 'Converted Amount (IRR)',
            result_rate_applied: 'Applied Rate',
            summary_convert: '${usdAmount} USD on {date} equals {irrAmount} at an exchange rate of {rate} per USD.',
            unit_toman: 'Toman',
            preset_ytd: 'YTD',
            preset_1y: '1Y',
            preset_5y: '5Y',
            preset_all: 'All',
            chart_y_axis: 'IRR per USD (log scale)',
            chart_dataset_label: 'IRR per USD',
            chart_no_data: 'No data',
        },
        fa: {
            app_title: 'کاوشگر نرخ ارز دلار به ریال',
            today_rate_label: 'نرخ امروز',
            today_rate_as_of: 'در تاریخ {date}',
            tab_revalue: 'ارزش‌گذاری مبلغ',
            tab_compare: 'مقایسه قیمت اقلام',
            tab_history: 'کاوش تاریخچه',
            revalue_heading: 'تحلیل قدرت خرید',
            revalue_intro: 'ببینید قدرت خرید یک مبلغ ثابت ریالی بر حسب دلار آمریکا بین دو تاریخ چگونه تغییر کرده است.',
            compare_heading: 'مقایسه قیمت اقلام',
            compare_intro: 'دو قیمت تاریخی ریالی یک کالا (مثلاً خودرو) را مقایسه کنید تا ببینید بر حسب دلار واقعی ارزان‌تر شده یا گران‌تر.',
            history_heading: 'کاوش نرخ تاریخی',
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
            footer_github_html: 'داده‌ها و کد منبع پروژه در <a href="https://github.com/fellowgeek/rial-scope" target="_blank" rel="noopener noreferrer" class="footer-link">گیت‌هاب</a> در دسترس است.',
            result_usd_at_a: 'ارزش دلاری در تاریخ الف',
            result_usd_at_b: 'ارزش دلاری در تاریخ ب',
            result_usd_a: 'کالای الف به دلار',
            result_usd_b: 'کالای ب به دلار',
            result_delta_usd: 'اختلاف دلاری',
            result_delta_pct: 'اختلاف درصدی',
            result_rial_loss: 'تغییر ارزش ریال',
            result_rate_change: 'تغییر نرخ دلار',
            result_item_price_delta: 'تغییر قیمت دلاری کالا',
            chip_gain: 'سود',
            chip_loss: 'زیان',
            fallback_badge: 'درخواستی {requested} ← اعمال‌شده {applied}',
            error_generic: 'مشکلی پیش آمد. لطفاً ورودی‌ها را بررسی کرده و دوباره تلاش کنید.',
            error_invalid_amount: 'لطفاً یک مبلغ مثبت معتبر وارد کنید.',
            error_invalid_dates: 'لطفاً تاریخ‌های معتبر انتخاب کنید.',
            summary_revalue_gain: '{amount} در تاریخ {dateA} معادل {usdA}$ بود، اما در تاریخ {dateB} معادل {usdB}$ شد — سودی معادل {magnitude} از نظر ارزش دلاری؛ در این بازه ریال {rialLoss} تقویت شد ({rateChange} تغییر نرخ دلار).',
            summary_revalue_loss: '{amount} در تاریخ {dateA} معادل {usdA}$ بود، اما در تاریخ {dateB} تنها معادل {usdB}$ می‌شود — زیانی معادل {magnitude} از نظر ارزش دلاری؛ در این بازه ریال {rialLoss} از ارزش خود را در برابر دلار از دست داد ({rateChange} تغییر نرخ دلار).',
            summary_revalue_same: '{amount} هم در تاریخ {dateA} و هم در تاریخ {dateB} معادل {usdA}$ بود — قدرت خرید دلاری آن در این بازه تغییری نکرده است.',
            summary_compare_more: 'کالای الف در تاریخ {dateA} معادل {usdA}$ بود، در حالی‌که کالای ب در تاریخ {dateB} معادل {usdB}$ بود — کالای ب از نظر ارزش واقعی دلاری {magnitude} گران‌تر است (در این بازه ارزش ریال {rialLoss} تغییر کرد، {rateChange} تغییر نرخ).',
            summary_compare_less: 'کالای الف در تاریخ {dateA} معادل {usdA}$ بود، در حالی‌که کالای ب در تاریخ {dateB} معادل {usdB}$ بود — کالای ب از نظر ارزش واقعی دلاری {magnitude} ارزان‌تر است (در این بازه ارزش ریال {rialLoss} تغییر کرد، {rateChange} تغییر نرخ).',
            summary_compare_same: 'هر دو کالا از نظر ارزش واقعی دلاری برابر بودند، {usdA}$، با وجود قیمت‌ها و تاریخ‌های ریالی متفاوت (در این بازه ارزش ریال {rialLoss} تغییر کرد، {rateChange} تغییر نرخ).',
            tab_convert: 'تبدیل دلار به ریال',
            convert_heading: 'مبدل دلار به ریال',
            convert_intro: 'تبدیل دلار آمریکا به ریال ایران بر اساس نرخ ارز در تاریخ انتخابی.',
            label_amount_usd: 'مبلغ (دلار)',
            result_converted_irr: 'مبلغ تبدیل شده (ریال)',
            result_rate_applied: 'نرخ اعمال‌شده',
            summary_convert: 'در تاریخ {date}، مبلغ ${usdAmount} دلار معادل {irrAmount} با نرخ {rate} به ازای هر دلار است.',
            unit_toman: 'تومان',
            preset_ytd: 'از ابتدای سال',
            preset_1y: '۱ ساله',
            preset_5y: '۵ ساله',
            preset_all: 'همه',
            chart_y_axis: 'ریال به ازای هر دلار (مقیاس لگاریتمی)',
            chart_dataset_label: 'ریال به ازای هر دلار',
            chart_no_data: 'بدون داده',
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
        lastConvert: null,
    };

    function t(key) {
        const dict = I18N[state.lang] || I18N.en;
        return dict[key] || I18N.en[key] || key;
    }

    function format(template, params) {
        return template.replace(/\{(\w+)\}/g, (_, k) => (k in params ? params[k] : `{${k}}`));
    }

    function formatDateForDisplay(isoDate) {
        return isoDate ? `\u200E${isoDate}\u200E` : '';
    }

    function formatNumber(value, fractionDigits) {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: fractionDigits ?? 2,
            minimumFractionDigits: 0,
        }).format(value);
    }

    function formatSmartPercent(value, showSign = false) {
        if (value === null || value === undefined || !Number.isFinite(value)) return '—';
        const abs = Math.abs(value);
        let fractionDigits = 2;
        if (abs >= 99.999 && abs < 100) {
            fractionDigits = 4;
        } else if (abs >= 99.99 && abs < 100) {
            fractionDigits = 4;
        } else if (abs >= 99.9 && abs < 100) {
            fractionDigits = 3;
        } else if (abs >= 99 && abs < 100) {
            fractionDigits = 3;
        } else if (abs > 0 && abs < 0.01) {
            fractionDigits = 4;
        } else if (abs > 0 && abs < 0.1) {
            fractionDigits = 3;
        }
        const formatted = formatNumber(value, fractionDigits);
        const sign = showSign && value > 0 ? '+' : '';
        return `${sign}${formatted}%`;
    }

    function formatToman(irrValue, fractionDigits) {
        if (!Number.isFinite(irrValue)) return '';
        const tomanValue = irrValue / 10;
        return `${formatNumber(tomanValue, fractionDigits ?? 0)} ${t('unit_toman')}`;
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
        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            el.innerHTML = t(el.dataset.i18nHtml);
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
        if (state.lastConvert) {
            renderConvertResult(state.lastConvert.payload);
        }
        if (state.chart) {
            if (state.chart.__rawSeries) {
                renderChart(state.chart.__rawSeries);
            } else {
                state.chart.resize();
            }
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
        const dateHtml = `<span dir="ltr" class="today-rate-date-val">${formatDateForDisplay(latest.date)}</span>`;
        dateEl.innerHTML = format(t('today_rate_as_of'), { date: dateHtml });
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
                    requestAnimationFrame(() => {
                        if (state.chart) {
                            state.chart.resize();
                        }
                    });
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
    // History explorer's From input defaults to Year To Date (YYYY-01-01),
    // while To remains empty (open-ended to latest date).
    function getYtdStartDate() {
        const year = state.maxDate ? state.maxDate.slice(0, 4) : new Date().getFullYear().toString();
        return `${year}-01-01`;
    }

    function getNYearsAgoDate(years) {
        if (!state.maxDate) return undefined;
        const d = new Date(state.maxDate + 'T00:00:00Z');
        d.setUTCFullYear(d.getUTCFullYear() - years);
        return d.toISOString().slice(0, 10);
    }

    function initDatePickers() {
        const ytdFrom = getYtdStartDate();
        document.querySelectorAll('.date-input').forEach((input) => {
            attachDateMask(input);
            let defaultDate;
            if (input.id === 'history-from') {
                defaultDate = ytdFrom;
            } else if (input.id === 'history-to') {
                defaultDate = undefined;
            } else {
                defaultDate = state.maxDate || undefined;
            }

            const fp = window.flatpickr(input, {
                dateFormat: 'Y-m-d',
                minDate: state.minDate,
                maxDate: state.maxDate || undefined,
                defaultDate: defaultDate,
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

    function deltaChip(value) {
        if (value > 0) return `<span class="result-chip positive">${t('chip_gain')}</span>`;
        if (value < 0) return `<span class="result-chip negative">${t('chip_loss')}</span>`;
        return '';
    }

    function pctPhrase(deltaPercent) {
        return deltaPercent === null || deltaPercent === undefined ? '' : ` (${formatSmartPercent(Math.abs(deltaPercent), false)})`;
    }

    function buildRevalueSummary(amount, dateA, dateB, revalue) {
        const tomanStr = formatToman(amount, 0);
        const amountDisplay = `${formatNumber(amount, 0)} IRR (${tomanStr})`;
        const rialLossPct = revalue.rial_value_delta_percent ?? revalue.delta_percent;
        const rateChangePct = revalue.exchange_rate_delta_percent;
        const params = {
            amount: amountDisplay,
            usdA: formatNumber(revalue.usd_at_a),
            usdB: formatNumber(revalue.usd_at_b),
            dateA: formatDateForDisplay(dateA.applied_date),
            dateB: formatDateForDisplay(dateB.applied_date),
            magnitude: `$${formatNumber(Math.abs(revalue.delta_usd))}${pctPhrase(revalue.delta_percent)}`,
            rialLoss: formatSmartPercent(Math.abs(rialLossPct), false),
            rateChange: formatSmartPercent(rateChangePct, true),
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
        const rialLossPct = compareItems.rial_value_delta_percent;
        const rateChangePct = compareItems.exchange_rate_delta_percent;
        const params = {
            usdA: formatNumber(compareItems.usd_a),
            usdB: formatNumber(compareItems.usd_b),
            dateA: formatDateForDisplay(dateA.applied_date),
            dateB: formatDateForDisplay(dateB.applied_date),
            magnitude: `$${formatNumber(Math.abs(compareItems.delta_usd))}${pctPhrase(compareItems.delta_percent)}`,
            rialLoss: formatSmartPercent(Math.abs(rialLossPct), false),
            rateChange: formatSmartPercent(rateChangePct, true),
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
        const pctClass = deltaClass(revalue.delta_usd);
        const rialLossVal = revalue.rial_value_delta_percent ?? revalue.delta_percent;
        const rateChangeVal = revalue.exchange_rate_delta_percent;

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
                    ${deltaChip(revalue.delta_usd)}
                    <span class="result-card-label">${t('result_delta_usd')}</span>
                    <span class="result-card-value large ${deltaClass(revalue.delta_usd)}">${deltaIcon(revalue.delta_usd)} $${formatNumber(Math.abs(revalue.delta_usd))}</span>
                    <div class="result-card-meta">
                        <span class="result-card-subcaption">${t('result_rial_loss')}: <strong>${formatSmartPercent(rialLossVal, true)}</strong></span>
                        <span class="result-card-subcaption">${t('result_rate_change')}: <strong>${formatSmartPercent(rateChangeVal, true)}</strong></span>
                    </div>
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
        const pctClass = deltaClass(compare_items.delta_usd);
        const rialLossVal = compare_items.rial_value_delta_percent;
        const rateChangeVal = compare_items.exchange_rate_delta_percent;

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
                    ${deltaChip(compare_items.delta_usd)}
                    <span class="result-card-label">${t('result_delta_usd')}</span>
                    <span class="result-card-value large ${deltaClass(compare_items.delta_usd)}">${deltaIcon(compare_items.delta_usd)} $${formatNumber(Math.abs(compare_items.delta_usd))}</span>
                    <div class="result-card-meta">
                        <span class="result-card-subcaption">${t('result_item_price_delta')}: <strong>${formatSmartPercent(compare_items.delta_percent, true)}</strong></span>
                        <span class="result-card-subcaption">${t('result_rial_loss')}: <strong>${formatSmartPercent(rialLossVal, true)}</strong></span>
                        <span class="result-card-subcaption">${t('result_rate_change')}: <strong>${formatSmartPercent(rateChangeVal, true)}</strong></span>
                    </div>
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

    function buildConvertSummary(payload) {
        const tomanRateStr = formatToman(payload.rate_irr_per_usd);
        const tomanAmountStr = formatToman(payload.converted_irr, 0);
        const params = {
            usdAmount: formatNumber(payload.usd_amount),
            date: formatDateForDisplay(payload.applied_date),
            irrAmount: `${formatNumber(payload.converted_irr, 0)} IRR (${tomanAmountStr})`,
            rate: `${formatNumber(payload.rate_irr_per_usd)} IRR (${tomanRateStr})`,
        };
        return format(t('summary_convert'), params);
    }

    function renderConvertResult(payload) {
        const box = document.getElementById('convert-result');
        if (!box || !payload) return;

        const rateToman = formatToman(payload.rate_irr_per_usd);
        const convertedToman = formatToman(payload.converted_irr, 0);

        box.innerHTML = `
            <div class="result-cards">
                <div class="result-card">
                    <span class="result-card-label">${t('label_date')}</span>
                    <span class="result-card-date">${formatDateForDisplay(payload.applied_date)}</span>
                    ${fallbackBadge(payload)}
                    <span class="result-card-value">${formatNumber(payload.rate_irr_per_usd)} IRR</span>
                    <span class="result-card-toman">(${rateToman})</span>
                    <span class="result-card-caption">${t('result_rate_applied')}</span>
                </div>
                <div class="result-card">
                    <span class="result-card-label">${t('result_converted_irr')}</span>
                    <span class="result-card-value large">${formatNumber(payload.converted_irr, 0)} IRR</span>
                    <span class="result-card-toman">(${convertedToman})</span>
                    <span class="result-card-caption">$${formatNumber(payload.usd_amount)} USD</span>
                </div>
            </div>
            <p class="result-summary">${buildConvertSummary(payload)}</p>
        `;
        box.hidden = false;
        state.lastConvert = { payload };
    }

    function initConvertForm() {
        const form = document.getElementById('convert-form');
        if (!form) return;

        form.addEventListener('submit', async (evt) => {
            evt.preventDefault();

            const amountUsd = parseAmountValue(document.getElementById('convert-amount-usd'));
            const convertDate = document.getElementById('convert-date').value;

            if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
                showError(t('error_invalid_amount'));
                return;
            }
            if (!convertDate) {
                showError(t('error_invalid_dates'));
                return;
            }

            try {
                const payload = await apiGet({
                    action: 'lookup',
                    date: convertDate,
                    usd_amount: String(amountUsd),
                });
                renderConvertResult(payload);
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
                        label: t('chart_dataset_label'),
                        data,
                        borderColor: '#8c442e',
                        backgroundColor: 'rgba(140, 68, 46, 0.12)',
                        spanGaps: false,
                        pointRadius: 0,
                        borderWidth: 1.75,
                        tension: 0.1,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: { maxTicksLimit: 10, autoSkip: true, color: '#54433e' },
                        grid: { color: '#ebe0dd' },
                    },
                    y: {
                        type: 'logarithmic',
                        title: { display: true, text: t('chart_y_axis'), color: '#54433e' },
                        ticks: { color: '#54433e' },
                        grid: { color: '#ebe0dd' },
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (item) => (item.raw === null ? t('chart_no_data') : `${formatNumber(item.raw)} IRR/USD (${formatToman(item.raw)}/USD)`),
                        },
                    },
                },
                onClick: (evt, elements) => {
                    if (!elements.length) return;
                    const index = elements[0].index;
                    const label = labels[index];
                    if (label && /^\d{4}-\d{2}-\d{2}$/.test(label)) {
                        const fromInput = document.getElementById('history-from');
                        fromInput.value = label;
                        if (fromInput._flatpickr) {
                            fromInput._flatpickr.setDate(label, false);
                        }
                        updatePresetFromInputs();
                    }
                },
            },
        });
        state.chart.__rawSeries = series;
    }

    async function loadHistory(from, to) {
        const fromVal = from !== undefined ? from : (document.getElementById('history-from')?.value || undefined);
        const toVal = to !== undefined ? to : (document.getElementById('history-to')?.value || undefined);
        try {
            const payload = await apiGet({
                action: 'series',
                ...(fromVal ? { from: fromVal } : {}),
                ...(toVal ? { to: toVal } : {}),
            });
            renderChart(payload.series);
        } catch (err) {
            showError(err.message || t('error_generic'));
        }
    }

    function setHistoryDateRange(fromDate, toDate) {
        const fromInput = document.getElementById('history-from');
        const toInput = document.getElementById('history-to');

        fromInput.value = fromDate || '';
        if (fromInput._flatpickr) {
            if (fromDate) {
                fromInput._flatpickr.setDate(fromDate, false);
            } else {
                fromInput._flatpickr.clear();
            }
        }

        toInput.value = toDate || '';
        if (toInput._flatpickr) {
            if (toDate) {
                toInput._flatpickr.setDate(toDate, false);
            } else {
                toInput._flatpickr.clear();
            }
        }
    }

    function setActivePreset(rangeName) {
        document.querySelectorAll('.btn-preset').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.range === rangeName);
        });
    }

    function updatePresetFromInputs() {
        const fromVal = document.getElementById('history-from').value;
        const toVal = document.getElementById('history-to').value;
        const ytdFrom = getYtdStartDate();
        const y1From = getNYearsAgoDate(1);
        const y5From = getNYearsAgoDate(5);

        if (!toVal && fromVal === ytdFrom) {
            setActivePreset('ytd');
        } else if (!toVal && fromVal === y1From) {
            setActivePreset('1y');
        } else if (!toVal && fromVal === y5From) {
            setActivePreset('5y');
        } else if (!toVal && !fromVal) {
            setActivePreset('all');
        } else {
            setActivePreset(null);
        }
    }

    function initHistoryControls() {
        document.getElementById('history-reload').addEventListener('click', () => {
            const from = document.getElementById('history-from').value || undefined;
            const to = document.getElementById('history-to').value || undefined;
            updatePresetFromInputs();
            loadHistory(from, to);
        });

        document.querySelectorAll('.btn-preset').forEach((btn) => {
            btn.addEventListener('click', () => {
                const range = btn.dataset.range;
                let fromDate;
                let toDate;

                if (range === 'ytd') {
                    fromDate = getYtdStartDate();
                } else if (range === '1y') {
                    fromDate = getNYearsAgoDate(1);
                } else if (range === '5y') {
                    fromDate = getNYearsAgoDate(5);
                } else if (range === 'all') {
                    fromDate = undefined;
                    toDate = undefined;
                }

                setHistoryDateRange(fromDate, toDate);
                setActivePreset(range);
                loadHistory(fromDate, toDate);
            });
        });

        ['history-from', 'history-to'].forEach((id) => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', updatePresetFromInputs);
                input.addEventListener('input', updatePresetFromInputs);
            }
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
        initConvertForm();
        initCompareForm();
        initHistoryControls();

        applyTranslations();
        loadHistory();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
