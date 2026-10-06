/** Handles input, API requests, results and history. */
(function () {
    'use strict';

    const expressionEl = document.getElementById('expression');
    const resultEl = document.getElementById('result');
    const errorEl = document.getElementById('error');
    const historyList = document.getElementById('history-list');
    const historyEmpty = document.getElementById('history-empty');
    const historyStatus = document.getElementById('history-status');
    const clearHistoryButton = document.getElementById('clear-history');
    const calculateButton = document.getElementById('calculate-button');
    const historyKeyword = document.getElementById('history-keyword');
    const searchHistoryButton = document.getElementById('search-history');
    const previousPageButton = document.getElementById('previous-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const historyPagination = document.getElementById('history-pagination');
    const conversionValue = document.getElementById('conversion-value');
    const fromBase = document.getElementById('from-base');
    const toBase = document.getElementById('to-base');
    const swapBasesButton = document.getElementById('swap-bases');
    const convertButton = document.getElementById('convert-button');
    const conversionResult = document.getElementById('conversion-result');
    const conversionError = document.getElementById('conversion-error');

    let expression = '';
    let isCalculating = false;
    let currentPage = 0;
    let totalPages = 0;
    let currentKeyword = '';
    const PAGE_SIZE = 5;

    /** Shows the expression entered by the user. */
    function renderExpression() {
        expressionEl.textContent = expression || '\u00a0';
    }

    /** Adds a character to the expression. */
    function input(char) {
        expression += char;
        renderExpression();
        clearResult();
    }

    function clearResult() {
        resultEl.textContent = '\u00a0';
        errorEl.textContent = '';
    }

    /** Removes the last character. */
    function backspace() {
        expression = expression.slice(0, -1);
        renderExpression();
        clearResult();
    }

    /** Clears the current expression and result. */
    function clearAll() {
        expression = '';
        renderExpression();
        clearResult();
    }

    /** Changes the displayed symbols to API operators. */
    function toApiExpression(expr) {
        return expr.replace(/×/g, '*').replace(/÷/g, '/');
    }

    /** Asks the backend to calculate and save the result. */
    async function doCalculate() {
        if (isCalculating) {
            return;
        }
        if (!expression) {
            errorEl.textContent = 'Please enter an expression';
            return;
        }
        isCalculating = true;
        calculateButton.disabled = true;
        const apiExpr = toApiExpression(expression);
        errorEl.textContent = 'Calculating...';
        try {
            const resp = await calculate(apiExpr);
            if (resp.success) {
                resultEl.textContent = resp.result;
                errorEl.textContent = '';
                await loadHistory();
            } else {
                resultEl.textContent = '\u00a0';
                errorEl.textContent = resp.message || 'Calculation failed';
            }
        } catch (e) {
            resultEl.textContent = '\u00a0';
            errorEl.textContent = 'Cannot connect to the backend';
        } finally {
            isCalculating = false;
            calculateButton.disabled = false;
        }
    }

    /** Reads a history page from the backend database. */
    async function loadHistory(page) {
        if (Number.isInteger(page)) {
            currentPage = Math.max(0, page);
        }
        historyStatus.textContent = 'Loading...';
        try {
            const resp = await getHistory(currentKeyword, currentPage, PAGE_SIZE);
            if (!resp.success) {
                historyEmpty.textContent = 'Could not load history';
                historyEmpty.style.display = 'block';
                historyStatus.textContent = resp.message || 'Could not load history';
                return;
            }
            const data = resp.data || {};
            const records = data.records || [];
            totalPages = data.totalPages || 0;
            if (!records.length && currentPage > 0 && currentPage >= totalPages) {
                currentPage = Math.max(0, totalPages - 1);
                await loadHistory(currentPage);
                return;
            }
            historyStatus.textContent = data.totalElements
                ? 'Records: ' + data.totalElements
                : '';
            renderHistory(records);
            renderPagination();
        } catch (e) {
            historyEmpty.textContent = 'Cannot connect to the backend';
            historyEmpty.style.display = 'block';
            historyStatus.textContent = 'Cannot connect to the backend';
        }
    }

    function renderPagination() {
        const displayPage = totalPages === 0 ? 0 : currentPage + 1;
        pageInfo.textContent = 'Page ' + displayPage + ' / ' + totalPages;
        previousPageButton.disabled = currentPage <= 0;
        nextPageButton.disabled = totalPages === 0 || currentPage >= totalPages - 1;
        historyPagination.style.display = totalPages > 1 ? 'flex' : 'none';
    }

    function renderHistory(records) {
        historyList.replaceChildren();
        historyEmpty.textContent = 'No history yet';
        if (!records.length) {
            historyEmpty.style.display = 'block';
            return;
        }
        historyEmpty.style.display = 'none';
        records.forEach(function (record) {
            const li = document.createElement('li');
            li.className = 'history-item';

            const math = document.createElement('div');
            math.className = 'history-math';
            math.appendChild(document.createTextNode(
                toDisplayExpression(record.expression) + ' = '
            ));
            const historyResult = document.createElement('span');
            historyResult.className = 'history-result';
            historyResult.textContent = record.result;
            math.appendChild(historyResult);

            const time = document.createElement('div');
            time.className = 'history-time';
            time.textContent = formatTime(record.createdAt);

            const del = document.createElement('button');
            del.className = 'delete-btn';
            del.textContent = 'Delete';
            del.addEventListener('click', async function () {
                del.disabled = true;
                historyStatus.textContent = 'Deleting...';
                try {
                    const resp = await deleteHistory(record.id);
                    if (!resp.success) {
                        historyStatus.textContent = resp.message || 'Could not delete the record';
                        return;
                    }
                    await loadHistory(currentPage);
                } catch (e) {
                    historyStatus.textContent = 'Cannot connect to the backend';
                } finally {
                    del.disabled = false;
                }
            });

            const left = document.createElement('div');
            left.appendChild(math);
            left.appendChild(time);

            li.appendChild(left);
            li.appendChild(del);
            historyList.appendChild(li);
        });
    }

    /** Uses the same operator symbols in the history and calculator. */
    function toDisplayExpression(expr) {
        return expr.replace(/\*/g, '×').replace(/\//g, '÷');
    }

    /** Shows the date and time without the seconds. */
    function formatTime(iso) {
        if (!iso) {
            return '';
        }
        return iso.replace('T', ' ').substring(0, 16);
    }

    /** Connects the calculator buttons to their actions. */
    document.querySelectorAll('.btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const action = btn.dataset.action;
            if (action === 'clear') {
                clearAll();
            } else if (action === 'backspace') {
                backspace();
            } else if (action === 'calculate') {
                doCalculate();
            } else if (action === 'input' || btn.dataset.value) {
                input(btn.dataset.value);
            }
        });
    });

    clearHistoryButton.addEventListener('click', async function () {
        if (confirm('Clear all calculation history?')) {
            clearHistoryButton.disabled = true;
            historyStatus.textContent = 'Clearing...';
            try {
                const resp = await clearHistory();
                if (!resp.success) {
                    historyStatus.textContent = resp.message || 'Could not clear history';
                    return;
                }
                await loadHistory(0);
            } catch (e) {
                historyStatus.textContent = 'Cannot connect to the backend';
            } finally {
                clearHistoryButton.disabled = false;
            }
        }
    });

    function searchHistory() {
        currentKeyword = historyKeyword.value.trim();
        loadHistory(0);
    }

    searchHistoryButton.addEventListener('click', searchHistory);
    historyKeyword.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchHistory();
            event.preventDefault();
        }
    });
    previousPageButton.addEventListener('click', function () {
        loadHistory(currentPage - 1);
    });
    nextPageButton.addEventListener('click', function () {
        loadHistory(currentPage + 1);
    });

    async function doConvert() {
        const value = conversionValue.value.trim();
        if (!value) {
            conversionError.textContent = 'Please enter an integer';
            return;
        }
        convertButton.disabled = true;
        conversionResult.textContent = '';
        conversionError.textContent = 'Converting...';
        try {
            const resp = await convertBase(
                value, Number(fromBase.value), Number(toBase.value)
            );
            if (!resp.success) {
                conversionError.textContent = resp.message || 'Conversion failed';
                return;
            }
            conversionResult.textContent = resp.data.result;
            conversionError.textContent = '';
        } catch (e) {
            conversionError.textContent = 'Cannot connect to the backend';
        } finally {
            convertButton.disabled = false;
        }
    }

    convertButton.addEventListener('click', doConvert);
    conversionValue.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            doConvert();
            event.preventDefault();
        }
    });
    swapBasesButton.addEventListener('click', function () {
        const previousFromBase = fromBase.value;
        fromBase.value = toBase.value;
        toBase.value = previousFromBase;
        conversionResult.textContent = '';
        conversionError.textContent = '';
    });

    // Handle keyboard shortcuts.
    document.addEventListener('keydown', function (e) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
            return;
        }
        const key = e.key;
        if (/^[0-9.+\-*/().^]$/.test(key)) {
            input(key);
            e.preventDefault();
        } else if (key === 'Enter') {
            doCalculate();
            e.preventDefault();
        } else if (key === 'Backspace') {
            backspace();
        } else if (key === 'Escape') {
            clearAll();
        }
    });

    // Read history when the page opens.
    loadHistory(0);
})();
