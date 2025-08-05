const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function summarizeThread(url: string) {
    const response = await fetch(`${API_BASE}/summarize`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to summarize thread');
    }

    return response.json();
}

export function validateUrl(url: string) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname.includes('reddit.com') ||
            parsedUrl.hostname.includes('news.ycombinator.com');
    } catch {
        return false;
    }
}

export function detectPlatform(url: string) {
    if (url.includes('reddit.com')) return 'Reddit';
    if (url.includes('news.ycombinator.com')) return 'Hacker News';
    return 'Unknown';
}
