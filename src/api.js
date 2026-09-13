const BASE_URL = 'https://solve.ivy.homes';
export const API_KEY = 'IVY26-F719CF9B06F8';
export const getCurrentUser = () => JSON.parse(localStorage.getItem('ivy_user') || 'null');

export const getHeaders = () => {
    const token = localStorage.getItem('ivy_token');
    return { 'Content-Type': 'application/json', 'X-API-Key': API_KEY, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

async function refreshSession() {
    const refreshToken = localStorage.getItem('ivy_refresh_token');
    if (!refreshToken) return;
    const response = await fetch(`${BASE_URL}${localStorage.getItem('ivy_refresh_url') || '/auth/refresh'}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY }, body: JSON.stringify({ refresh_token: refreshToken }) });
    if (!response.ok) throw new Error('Your session has expired. Please sign in again.');
    const data = await response.json();
    localStorage.setItem('ivy_token', data.access_token);
    if (data.refresh_token) localStorage.setItem('ivy_refresh_token', data.refresh_token);
    localStorage.setItem('ivy_token_expires_at', String(Date.now() + (data.expires_in || 900) * 1000));
}

async function request(path, options = {}) {
    if (Number(localStorage.getItem('ivy_token_expires_at') || 0) - Date.now() < 60_000) await refreshSession();
    const response = await fetch(`${BASE_URL}${path}`, { ...options, headers: { ...getHeaders(), ...options.headers } });
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed (${response.status})`);
    }
    return response.json();
}

export async function loginUser(email, password) {
    const response = await fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY }, body: JSON.stringify({ email, password }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) throw new Error(data.detail || 'Authentication failed');
    const user = data.user || { email };
    localStorage.setItem('ivy_token', data.access_token);
    localStorage.setItem('ivy_refresh_token', data.refresh_token);
    localStorage.setItem('ivy_refresh_url', data.refresh_url || '/auth/refresh');
    localStorage.setItem('ivy_token_expires_at', String(Date.now() + (data.expires_in || 900) * 1000));
    localStorage.setItem('ivy_user', JSON.stringify(user));
    return { ...data, user };
}

export const fetchListings = (offset = 0, limit = 30) => request(`/v1/listings?offset=${offset}&limit=${limit}`);
export const fetchListing = (id) => request(`/v1/listings/${encodeURIComponent(id)}`);
export const fetchRentals = (offset = 0, limit = 30) => request(`/v1/rentals?offset=${offset}&limit=${limit}`);
export const fetchProjects = (offset = 0, limit = 30) => request(`/v1/projects?offset=${offset}&limit=${limit}`);
export const fetchAnalyticsSummary = () => request('/v1/analytics/summary');

async function fetchAll(fetchPage, limit = 50) {
    const records = [];
    let offset = 0;
    while (true) {
        const data = await fetchPage(offset, limit);
        const page = data.results || [];
        records.push(...page);
        if (!data.has_more || page.length === 0) return records;
        offset += page.length;
    }
}

export const fetchAllListings = () => fetchAll(fetchListings);
export const fetchAllProjects = () => fetchAll(fetchProjects);
