import axios from 'axios';

// Per-sandbox agent API on {sandboxId}.agent.localhost
// Note: called directly from browser (no Vite proxy)

const agentBaseURL = (sandboxId) =>
  `http://${sandboxId}.agent.localhost`;

export const createAgentApi = (sandboxId) =>
  axios.create({
    baseURL: agentBaseURL(sandboxId),
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

// ── File operations ───────────────────────────────────────────

export const listFiles = async (sandboxId) => {
  const client = createAgentApi(sandboxId);
  const res = await client.get('/list-files');
  return res.data;
};

export const readFile = async (sandboxId, filePath) => {
  const client = createAgentApi(sandboxId);
  const res = await client.get('/read-files', {
    params: { files: filePath },
  });
  return res.data;
};

export const updateFiles = async (sandboxId, updates) => {
  // updates: [{ file: string, content: string }]
  const client = createAgentApi(sandboxId);
  const res = await client.patch('/update-files', { updates });
  return res.data;
};
