/**
 * 前端交互逻辑：按钮输入、发起计算请求、渲染结果与历史、错误提示。
 */
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

    /** 显示表达式（界面用 × ÷，发送给后端时转 * /） */
    function renderExpression() {
        expressionEl.textContent = expression || '\u00a0';
    }

    /** 输入字符 */
    function input(char) {
        expression += char;
        renderExpression();
        clearResult();
    }

    function clearResult() {
        resultEl.textContent = '\u00a0';
        errorEl.textContent = '';
    }

    /** 退格 */
    function backspace() {
        expression = expression.slice(0, -1);
        renderExpression();
        clearResult();
    }

    /** 清空 */
    function clearAll() {
        expression = '';
        renderExpression();
        clearResult();
    }

    /** 界面符号 → API 符号 */
    function toApiExpression(expr) {
        return expr.replace(/×/g, '*').replace(/÷/g, '/');
    }

    /** 发起计算请求（后端计算并保存历史） */
    async function doCalculate() {
        if (isCalculating) {
            return;
        }
        if (!expression) {
            errorEl.textContent = '请输入表达式';
            return;
        }
        isCalculating = true;
        calculateButton.disabled = true;
        const apiExpr = toApiExpression(expression);
        errorEl.textContent = '计算中...';
        try {
            const resp = await calculate(apiExpr);
            if (resp.success) {
                resultEl.textContent = resp.result;
                errorEl.textContent = '';
                await loadHistory();
            } else {
                resultEl.textContent = '\u00a0';
                errorEl.textContent = resp.message || '计算失败';
            }
        } catch (e) {
            resultEl.textContent = '\u00a0';
            errorEl.textContent = '无法连接后端服务';
        } finally {
            isCalculating = false;
            calculateButton.disabled = false;
        }
    }

    /** 加载并渲染历史（数据来自后端数据库） */
    async function loadHistory(page) {
        if (Number.isInteger(page)) {
            currentPage = Math.max(0, page);
        }
        historyStatus.textContent = '正在加载...';
        try {
            const resp = await getHistory(currentKeyword, currentPage, PAGE_SIZE);
            if (!resp.success) {
                historyEmpty.textContent = '加载历史失败';
                historyEmpty.style.display = 'block';
                historyStatus.textContent = resp.message || '加载历史失败';
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
                ? '共 ' + data.totalElements + ' 条记录'
                : '';
            renderHistory(records);
            renderPagination();
        } catch (e) {
            historyEmpty.textContent = '无法连接后端服务';
            historyEmpty.style.display = 'block';
            historyStatus.textContent = '无法连接后端服务';
        }
    }

    function renderPagination() {
        const displayPage = totalPages === 0 ? 0 : currentPage + 1;
        pageInfo.textContent = '第 ' + displayPage + ' / ' + totalPages + ' 页';
        previousPageButton.disabled = currentPage <= 0;
        nextPageButton.disabled = totalPages === 0 || currentPage >= totalPages - 1;
        historyPagination.style.display = totalPages > 1 ? 'flex' : 'none';
    }

    function renderHistory(records) {
        historyList.replaceChildren();
        historyEmpty.textContent = '暂无历史记录';
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
            del.textContent = '删除';
            del.addEventListener('click', async function () {
                del.disabled = true;
                historyStatus.textContent = '正在删除...';
                try {
                    const resp = await deleteHistory(record.id);
                    if (!resp.success) {
                        historyStatus.textContent = resp.message || '删除失败';
                        return;
                    }
                    await loadHistory(currentPage);
                } catch (e) {
                    historyStatus.textContent = '无法连接后端服务';
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

    /** 历史记录里的 * / 也显示为 × ÷，保持一致 */
    function toDisplayExpression(expr) {
        return expr.replace(/\*/g, '×').replace(/\//g, '÷');
    }

    /** 后端时间 "2026-10-01T10:20:00" → "2026-10-01 10:20" */
    function formatTime(iso) {
        if (!iso) {
            return '';
        }
        return iso.replace('T', ' ').substring(0, 16);
    }

    /** 按钮事件绑定 */
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
        if (confirm('确定清空全部计算历史？')) {
            clearHistoryButton.disabled = true;
            historyStatus.textContent = '正在清空...';
            try {
                const resp = await clearHistory();
                if (!resp.success) {
                    historyStatus.textContent = resp.message || '清空失败';
                    return;
                }
                await loadHistory(0);
            } catch (e) {
                historyStatus.textContent = '无法连接后端服务';
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
            conversionError.textContent = '请输入待转换整数';
            return;
        }
        convertButton.disabled = true;
        conversionResult.textContent = '';
        conversionError.textContent = '转换中...';
        try {
            const resp = await convertBase(
                value, Number(fromBase.value), Number(toBase.value)
            );
            if (!resp.success) {
                conversionError.textContent = resp.message || '转换失败';
                return;
            }
            conversionResult.textContent = resp.data.result;
            conversionError.textContent = '';
        } catch (e) {
            conversionError.textContent = '无法连接后端服务';
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

    // 键盘输入（加分项：键盘快捷键）
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

    // 页面加载时从后端拉取历史
    loadHistory(0);
})();
