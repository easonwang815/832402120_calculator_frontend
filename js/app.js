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

    let expression = '';

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
        if (!expression) {
            errorEl.textContent = '请输入表达式';
            return;
        }
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
        }
    }

    /** 加载并渲染历史（数据来自后端数据库） */
    async function loadHistory() {
        try {
            const resp = await getHistory();
            if (!resp.success) {
                historyEmpty.textContent = '加载历史失败';
                return;
            }
            renderHistory(resp.data || []);
        } catch (e) {
            historyEmpty.textContent = '无法连接后端服务';
        }
    }

    function renderHistory(records) {
        historyList.innerHTML = '';
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
            math.innerHTML = toDisplayExpression(record.expression)
                + ' = <span class="history-result">' + record.result + '</span>';

            const time = document.createElement('div');
            time.className = 'history-time';
            time.textContent = formatTime(record.createdAt);

            const del = document.createElement('button');
            del.className = 'delete-btn';
            del.textContent = '删除';
            del.addEventListener('click', function () {
                deleteHistory(record.id).then(loadHistory);
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
        if (!iso) return '';
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

    document.getElementById('clear-history').addEventListener('click', function () {
        if (confirm('确定清空全部计算历史？')) {
            clearHistory().then(loadHistory);
        }
    });

    // 键盘输入（加分项：键盘快捷键）
    document.addEventListener('keydown', function (e) {
        const key = e.key;
        if (/^[0-9.+\-*/().]$/.test(key)) {
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
    loadHistory();
})();
