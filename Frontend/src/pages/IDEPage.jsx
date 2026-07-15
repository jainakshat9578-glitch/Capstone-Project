import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { motion } from 'framer-motion';
import { useSandbox } from '../context/SandboxContext';
import TopNavbar from '../components/layout/TopNavbar';
import FileExplorer from '../components/explorer/FileExplorer';
import MonacoEditorPanel from '../components/editor/MonacoEditorPanel';
import ChatPanel from '../components/chat/ChatPanel';
import LivePreview from '../components/preview/LivePreview';
import TerminalPanel from '../components/terminal/TerminalPanel';
import { Code2, Monitor } from 'lucide-react';

// Right-top panel: tab between Editor and Preview
function RightTopPanel() {
  const { state } = useSandbox();
  const [activeTab, setActiveTab] = useState('preview');

  // Auto-switch to editor when a file is opened
  useEffect(() => {
    if (state.currentFile) setActiveTab('editor');
  }, [state.currentFile]);

  return (
    <div className="flex flex-col h-full">
      {/* Tab switcher */}
      <div className="flex items-center border-b border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
        <button
          onClick={() => setActiveTab('editor')}
          className={`editor-tab ${activeTab === 'editor' ? 'active' : ''} gap-1.5`}
        >
          <Code2 size={12} /> Editor
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`editor-tab ${activeTab === 'preview' ? 'active' : ''} gap-1.5`}
        >
          <Monitor size={12} /> Preview
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === 'editor' ? <MonacoEditorPanel /> : <LivePreview />}
      </div>
    </div>
  );
}

export default function IDEPage() {
  const { state } = useSandbox();
  const navigate = useNavigate();

  // Guard: if no sandboxId, send back to landing
  useEffect(() => {
    if (!state.sandboxId) navigate('/', { replace: true });
  }, [state.sandboxId, navigate]);

  if (!state.sandboxId) return null;

  return (
    <motion.div
      className="ide-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <TopNavbar />

      <div className="ide-body">
        {/* Outer horizontal split: sidebar | content */}
        <PanelGroup direction="horizontal" className="flex-1">

          {/* LEFT: File Explorer (20%) */}
          <Panel defaultSize={18} minSize={12} maxSize={30}
            style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}>
            <FileExplorer />
          </Panel>

          <PanelResizeHandle
            style={{ width: 4, cursor: 'col-resize', background: 'var(--border)' }}
            className="hover:bg-[var(--accent-bright)] transition-colors"
          />

          {/* CENTER: AI Chat (40%) */}
          <Panel defaultSize={38} minSize={25}
            style={{ background: 'var(--bg-base)', position: 'relative' }}>
            <ChatPanel />
          </Panel>

          <PanelResizeHandle
            style={{ width: 4, cursor: 'col-resize', background: 'var(--border)' }}
            className="hover:bg-[var(--accent-bright)] transition-colors"
          />

          {/* RIGHT: Editor/Preview + Terminal (42%) stacked vertically */}
          <Panel defaultSize={44} minSize={25}>
            <PanelGroup direction="vertical">
              {/* Editor + Preview container */}
              <Panel defaultSize={55} minSize={20}
                style={{ display: 'flex', flexDirection: 'column' }}>
                <RightTopPanel />
              </Panel>

              <PanelResizeHandle
                style={{ height: 4, cursor: 'row-resize', background: 'var(--border)' }}
                className="hover:bg-[var(--accent-bright)] transition-colors"
              />

              {/* Terminal (bottom) */}
              <Panel defaultSize={45} minSize={15}
                style={{ background: '#0d0d12', display: 'flex', flexDirection: 'column' }}>
                <TerminalPanel />
              </Panel>
            </PanelGroup>
          </Panel>

        </PanelGroup>
      </div>
    </motion.div>
  );
}
