# AI Sandbox IDE — Build Complete ✅

## Dev Server
**http://localhost:5173/** — running and ready.

---

## What Was Built

### Pages
| File | Description |
|---|---|
| [LandingPage.jsx](file:///c:/Users/aksha/Desktop/Capstone-Project/Frontend/src/pages/LandingPage.jsx) | Animated hero with particles, glow orbs, feature chips, Start Sandbox CTA |
| [IDEPage.jsx](file:///c:/Users/aksha/Desktop/Capstone-Project/Frontend/src/pages/IDEPage.jsx) | 4-panel IDE layout with resizable panels |

### Components
| File | Description |
|---|---|
| [TopNavbar.jsx](file:///c:/Users/aksha/Desktop/Capstone-Project/Frontend/src/components/layout/TopNavbar.jsx) | Logo, Sandbox ID (copy), socket status, restart, theme toggle |
| [FileExplorer.jsx](file:///c:/Users/aksha/Desktop/Capstone-Project/Frontend/src/components/explorer/FileExplorer.jsx) | Recursive file tree with icons, collapse/expand, active highlight |
| [MonacoEditorPanel.jsx](file:///c:/Users/aksha/Desktop/Capstone-Project/Frontend/src/components/editor/MonacoEditorPanel.jsx) | Tabbed Monaco editor, unsaved indicator, Ctrl+S, auto-language detection |
| [ChatPanel.jsx](file:///c:/Users/aksha/Desktop/Capstone-Project/Frontend/src/components/chat/ChatPanel.jsx) | SSE streaming chat, markdown, event timeline, stop generation, hints |
| [LivePreview.jsx](file:///c:/Users/aksha/Desktop/Capstone-Project/Frontend/src/components/preview/LivePreview.jsx) | iframe with URL bar, auto-refresh on save, loading/error states |
| [TerminalPanel.jsx](file:///c:/Users/aksha/Desktop/Capstone-Project/Frontend/src/components/terminal/TerminalPanel.jsx) | xterm.js + Socket.io, custom dark theme, clear, auto-reconnect |

### Services & Utilities
| File | Description |
|---|---|
| [api.js](file:///c:/Users/aksha/Desktop/Capstone-Project/Frontend/src/services/api.js) | Axios instance for `/api/*` endpoints |
| [agentApi.js](file:///c:/Users/aksha/Desktop/Capstone-Project/Frontend/src/services/agentApi.js) | Per-sandbox `{id}.agent.localhost` file operations |
| [SandboxContext.jsx](file:///c:/Users/aksha/Desktop/Capstone-Project/Frontend/src/context/SandboxContext.jsx) | Global state with useReducer |
| [languageMap.js](file:///c:/Users/aksha/Desktop/Capstone-Project/Frontend/src/utils/languageMap.js) | Extension → Monaco language ID mapping |
| [fileIcons.js](file:///c:/Users/aksha/Desktop/Capstone-Project/Frontend/src/utils/fileIcons.js) | File extension → Lucide icon + color mapping |

---

## Build Verification

```
✓ 2590 modules transformed
✓ Built in 1.97s
✓ No errors
```

> [!NOTE]
> Large chunk warning is expected — Monaco editor is ~730KB. This is normal for production IDE apps.

---

## API Wiring

| Action | Endpoint |
|---|---|
| Create sandbox | `POST /api/sandbox/start` |
| List files | `GET http://{id}.agent.localhost/list-files` |
| Read file | `GET http://{id}.agent.localhost/read-files?files=<path>` |
| Save file | `PATCH http://{id}.agent.localhost/update-files` |
| AI chat | `POST /api/ai/invoke` (SSE stream) |
| Terminal | Socket.io on `http://{id}.agent.localhost` |

---

## Key Behaviors
- **Landing → IDE** — Start Sandbox button calls real API, shows loading overlay, auto-navigates on success
- **SSE streaming** — native `fetch` + `ReadableStream` for real-time AI responses
- **Editor/Preview tabs** — right panel switches between Monaco editor and live preview; auto-switches to editor when a file is opened
- **Ctrl+S** — saves file via PATCH API and auto-refreshes preview iframe
- **Theme** — dark by default, toggle persisted in context, synced to `<html>` class
- **Socket reconnect** — 10 attempts with 1.5s delay, status shown in navbar
