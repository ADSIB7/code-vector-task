const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://code-vector-task.onrender.com";

export async function getJson(path, { signal } = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            Accept: "application/json"
        },
        signal
    });

    let body = null;

    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (!response.ok) {
        const message = body?.error || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return body;
}
