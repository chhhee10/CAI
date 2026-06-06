const BASE_URL = "http://localhost:8000";

export const api = {
    async query(clientId, queryText) {
        const res = await fetch(`${BASE_URL}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_id: clientId, query: queryText })
        });
        return res.json();
    },
    async getClients() {
        const res = await fetch(`${BASE_URL}/clients`);
        return res.json();
    },
    async getMemory(clientId) {
        const res = await fetch(`${BASE_URL}/memory/${clientId}?t=${Date.now()}`);
        return res.json();
    },
    async getBrief(clientId) {
        const res = await fetch(`${BASE_URL}/brief/${clientId}?t=${Date.now()}`);
        return res.json();
    },
    async getNotices(clientId) {
        const res = await fetch(`${BASE_URL}/notices/${clientId}`);
        return res.json();
    },
    async uploadDocument(clientId, ay, file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${BASE_URL}/upload/${clientId}/${ay}`, {
            method: 'POST',
            body: formData
        });
        return res.json();
    },
    async deleteMemory(key) {
        const res = await fetch(`${BASE_URL}/memory/${encodeURIComponent(key)}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};
