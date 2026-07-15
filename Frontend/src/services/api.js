import axios from 'axios';

// Base API for backend (proxied via Vite → http://localhost)
export const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Sandbox ──────────────────────────────────────────────────

export const startSandbox = () =>
  api.post('/sandbox/start').then(r => r.data);

export const restartSandbox = (sandboxId) =>
  api.post('/sandbox/restart', { sandboxId }).then(r => r.data);

// ── AI Invoke (SSE) ──────────────────────────────────────────
// Returns a native fetch response so caller can read the stream

export const invokeAI = async (message, projectId, signal) => {
  const response = await fetch('/api/ai/invoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, projectId }),
    signal,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API error ${response.status}`);
  }
  return response;
};
