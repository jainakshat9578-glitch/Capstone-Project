import { useRef, useCallback, useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Save, Loader2, FileCode } from 'lucide-react';
import { useSandbox } from '../../context/SandboxContext';
import { updateFiles } from '../../services/agentApi';
import { getLanguage } from '../../utils/languageMap';
import { getFileIcon } from '../../utils/fileIcons';
import toast from 'react-hot-toast';

function EditorTab({ tab, isActive, isUnsaved, onSelect, onClose }) {
  const { icon: Icon, color } = getFileIcon(tab.label);
  return (
    <div
      className={`editor-tab group ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(tab.path)}
      title={tab.path}
    >
      <Icon size={13} color={color} />
      <span className="text-xs truncate max-w-[120px]">{tab.label}</span>
      {isUnsaved && <span className="w-2 h-2 rounded-full bg-[var(--accent-bright)] flex-shrink-0" title="Unsaved" />}
      <button
        onClick={e => { e.stopPropagation(); onClose(tab.path); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-1"
      >
        ×
      </button>
    </div>
  );
}

export default function MonacoEditorPanel() {
  const { state, openTab, closeTab, setEditorContent, markUnsaved, markSaved, refreshPreview } = useSandbox();
  const editorRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const currentContent = state.editorContent[state.currentFile] ?? '';
  const language = getLanguage(state.currentFile ?? '');

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    // Add Ctrl+S save shortcut
    editor.addCommand(
      /* Monaco KeyMod.CtrlCmd | KeyCode.KeyS */ (1 << 11) | 49,
      () => handleSave()
    );
  };

  const handleChange = useCallback((value) => {
    if (!state.currentFile) return;
    setEditorContent(state.currentFile, value ?? '');
    markUnsaved(state.currentFile);
  }, [state.currentFile, setEditorContent, markUnsaved]);

  const handleSave = useCallback(async () => {
    if (!state.currentFile || saving) return;
    setSaving(true);
    try {
      await updateFiles(state.sandboxId, [
        { file: state.currentFile, content: state.editorContent[state.currentFile] ?? '' }
      ]);
      markSaved(state.currentFile);
      refreshPreview();
      toast.success('Files Updated Successfully', {
        icon: '✅',
        style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
      });
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [state.currentFile, state.sandboxId, state.editorContent, saving, markSaved, refreshPreview]);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>
      {/* Tabs bar */}
      <div className="flex items-center overflow-x-auto scrollbar-hide border-b border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
        {state.openTabs.map(tab => (
          <EditorTab
            key={tab.path}
            tab={tab}
            isActive={state.currentFile === tab.path}
            isUnsaved={state.unsavedFiles.has(tab.path)}
            onSelect={openTab}
            onClose={closeTab}
          />
        ))}
        <div className="flex-1" />
        {/* Save button */}
        <motion.button
          onClick={handleSave}
          disabled={saving || !state.currentFile}
          className="flex items-center gap-1.5 mr-2 px-3 py-1 rounded-md text-xs font-medium bg-[var(--accent)] hover:bg-[var(--accent-bright)] text-white transition-colors disabled:opacity-50 shrink-0"
          whileTap={{ scale: 0.96 }}
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          <span className="hidden sm:inline">Save</span>
        </motion.button>
      </div>

      {/* Current file path breadcrumb */}
      {state.currentFile && (
        <div className="flex items-center gap-1.5 px-3 py-1 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] shrink-0">
          <FileCode size={11} className="text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)] font-mono">{state.currentFile}</span>
          <span className="ml-auto text-xs text-[var(--text-muted)] opacity-60">{language}</span>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        {state.currentFile ? (
          <Editor
            key={state.currentFile}
            height="100%"
            language={language}
            value={currentContent}
            onMount={handleEditorMount}
            onChange={handleChange}
            theme={state.theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbersMinChars: 3,
              renderLineHighlight: 'gutter',
              padding: { top: 12 },
              smoothScrolling: true,
              cursorBlinking: 'phase',
              cursorSmoothCaretAnimation: 'on',
              bracketPairColorization: { enabled: true },
              tabSize: 2,
              wordWrap: 'on',
              formatOnPaste: true,
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-muted)]">
            <FileCode size={32} className="opacity-30" />
            <p className="text-sm">Select a file from the explorer</p>
          </div>
        )}
      </div>
    </div>
  );
}
