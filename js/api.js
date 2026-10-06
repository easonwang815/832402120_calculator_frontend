/** Sends HTTP requests to the backend. The frontend does not calculate answers. */
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

/** Calculates an expression. */
async function calculate(expression) {
    return apiFetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression })
    });
}

/** Searches and reads a history page. */
async function getHistory(keyword, page, size) {
    const params = new URLSearchParams({
        keyword: keyword || '',
        page: String(page),
        size: String(size)
    });
    return apiFetch('/history?' + params.toString());
}

/** Deletes one history record. */
async function deleteHistory(id) {
    return apiFetch('/history/' + id, { method: 'DELETE' });
}

/** Clears all history records. */
async function clearHistory() {
    return apiFetch('/history', { method: 'DELETE' });
}

/** Converts an integer to another base. */
async function convertBase(value, fromBase, toBase) {
    return apiFetch('/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, fromBase, toBase })
    });
}
