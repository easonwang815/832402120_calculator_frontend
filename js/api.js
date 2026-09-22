/**
 * API 请求封装：前后端通过 HTTP + JSON 通信。
 * 前端只发表达式，不参与任何计算。
 */
const apiBaseMeta = document.querySelector('meta[name="api-base"]');
const configuredApiBase = apiBaseMeta ? apiBaseMeta.content.trim() : '';
const isLocal = window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1';
const API_BASE = (configuredApiBase || (isLocal ? 'http://localhost:8080/api' : '/api'))
    .replace(/\/$/, '');

async function apiFetch(path, options) {
    const res = await fetch(API_BASE + path, options);
    let json;
    try {
        json = await res.json();
    } catch (e) {
        return {
            success: false,
            message: res.ok ? 'Invalid server response' : 'Request failed'
        };
    }
    if (!res.ok && json.success !== false) {
        return { success: false, message: json.message || 'Request failed' };
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
