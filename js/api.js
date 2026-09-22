/**
 * API 请求封装：前后端通过 HTTP + JSON 通信。
 * 前端只发表达式，不参与任何计算。
 */
const API_BASE = 'http://localhost:8080/api';

async function apiFetch(path, options) {
    const res = await fetch(API_BASE + path, options);
    let json;
    try {
        json = await res.json();
    } catch (e) {
        json = { success: false, message: 'Network error' };
    }
    return json;
}

/** 计算：POST /api/calculate */
async function calculate(expression) {
    return apiFetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression })
    });
}

/** 查询历史：GET /api/history */
async function getHistory() {
    return apiFetch('/history');
}

/** 删除指定历史：DELETE /api/history/{id} */
async function deleteHistory(id) {
    return apiFetch('/history/' + id, { method: 'DELETE' });
}

/** 清空全部历史：DELETE /api/history（加分项） */
async function clearHistory() {
    return apiFetch('/history', { method: 'DELETE' });
}
