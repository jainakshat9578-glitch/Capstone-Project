import { createContext, useContext, useReducer, useCallback } from 'react';

const SandboxContext = createContext(null);

const initialState = {
  // Sandbox
  sandboxId: null,
  previewURL: null,
  sandboxStatus: 'idle', // 'idle' | 'creating' | 'ready' | 'error'

  // Connection
  socketStatus: 'disconnected', // 'connected' | 'disconnected' | 'reconnecting'

  // File explorer
  fileTree: [],
  currentFile: null,
  openTabs: [],          // [{ path, label }]
  editorContent: {},     // { [path]: string }
  unsavedFiles: new Set(),

  // Chat
  chatMessages: [],      // [{ id, role, content, events, timestamp }]
  isGenerating: false,

  // Theme
  theme: 'dark',

  // Preview
  previewRefreshKey: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SANDBOX':
      return { ...state, sandboxId: action.sandboxId, previewURL: action.previewURL, sandboxStatus: 'ready' };
    case 'SET_SANDBOX_STATUS':
      return { ...state, sandboxStatus: action.status };
    case 'SET_SOCKET_STATUS':
      return { ...state, socketStatus: action.status };
    case 'SET_FILE_TREE':
      return { ...state, fileTree: action.tree };
    case 'SET_CURRENT_FILE':
      return { ...state, currentFile: action.path };
    case 'OPEN_TAB': {
      const exists = state.openTabs.find(t => t.path === action.path);
      return {
        ...state,
        currentFile: action.path,
        openTabs: exists ? state.openTabs : [...state.openTabs, { path: action.path, label: action.label }],
      };
    }
    case 'CLOSE_TAB': {
      const remaining = state.openTabs.filter(t => t.path !== action.path);
      const current = state.currentFile === action.path
        ? (remaining.length ? remaining[remaining.length - 1].path : null)
        : state.currentFile;
      const unsaved = new Set(state.unsavedFiles);
      unsaved.delete(action.path);
      return { ...state, openTabs: remaining, currentFile: current, unsavedFiles: unsaved };
    }
    case 'SET_EDITOR_CONTENT':
      return { ...state, editorContent: { ...state.editorContent, [action.path]: action.content } };
    case 'MARK_UNSAVED': {
      const s = new Set(state.unsavedFiles);
      s.add(action.path);
      return { ...state, unsavedFiles: s };
    }
    case 'MARK_SAVED': {
      const s = new Set(state.unsavedFiles);
      s.delete(action.path);
      return { ...state, unsavedFiles: s };
    }
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.message] };
    case 'UPDATE_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: state.chatMessages.map(m =>
          m.id === action.id ? { ...m, ...action.updates } : m
        ),
      };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.value };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'REFRESH_PREVIEW':
      return { ...state, previewRefreshKey: state.previewRefreshKey + 1 };
    case 'RESET_SANDBOX':
      return { ...initialState, theme: state.theme };
    default:
      return state;
  }
}

export function SandboxProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = {
    setSandbox: useCallback((sandboxId, previewURL) =>
      dispatch({ type: 'SET_SANDBOX', sandboxId, previewURL }), []),
    setSandboxStatus: useCallback((status) =>
      dispatch({ type: 'SET_SANDBOX_STATUS', status }), []),
    setSocketStatus: useCallback((status) =>
      dispatch({ type: 'SET_SOCKET_STATUS', status }), []),
    setFileTree: useCallback((tree) =>
      dispatch({ type: 'SET_FILE_TREE', tree }), []),
    openTab: useCallback((path, label) =>
      dispatch({ type: 'OPEN_TAB', path, label }), []),
    closeTab: useCallback((path) =>
      dispatch({ type: 'CLOSE_TAB', path }), []),
    setEditorContent: useCallback((path, content) =>
      dispatch({ type: 'SET_EDITOR_CONTENT', path, content }), []),
    markUnsaved: useCallback((path) =>
      dispatch({ type: 'MARK_UNSAVED', path }), []),
    markSaved: useCallback((path) =>
      dispatch({ type: 'MARK_SAVED', path }), []),
    addChatMessage: useCallback((message) =>
      dispatch({ type: 'ADD_CHAT_MESSAGE', message }), []),
    updateChatMessage: useCallback((id, updates) =>
      dispatch({ type: 'UPDATE_CHAT_MESSAGE', id, updates }), []),
    setGenerating: useCallback((value) =>
      dispatch({ type: 'SET_GENERATING', value }), []),
    toggleTheme: useCallback(() =>
      dispatch({ type: 'TOGGLE_THEME' }), []),
    refreshPreview: useCallback(() =>
      dispatch({ type: 'REFRESH_PREVIEW' }), []),
    resetSandbox: useCallback(() =>
      dispatch({ type: 'RESET_SANDBOX' }), []),
  };

  return (
    <SandboxContext.Provider value={{ state, ...actions }}>
      {children}
    </SandboxContext.Provider>
  );
}

export function useSandbox() {
  const ctx = useContext(SandboxContext);
  if (!ctx) throw new Error('useSandbox must be used within SandboxProvider');
  return ctx;
}
