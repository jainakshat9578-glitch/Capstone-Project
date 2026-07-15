import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, RefreshCw, FolderOpen, Loader2 } from 'lucide-react';
import { useSandbox } from '../../context/SandboxContext';
import { listFiles, readFile } from '../../services/agentApi';
import { getFileIcon } from '../../utils/fileIcons';
import toast from 'react-hot-toast';

function buildTree(paths = []) {
  const root = {};
  (Array.isArray(paths) ? paths : []).forEach(fullPath => {
    const parts = fullPath.replace(/^\//, '').split('/');
    let node = root;
    parts.forEach((part, i) => {
      if (!node[part]) node[part] = { __isDir: i < parts.length - 1, __path: '/' + parts.slice(0, i + 1).join('/'), __children: {} };
      if (i < parts.length - 1) node = node[part].__children;
    });
  });
  return root;
}

function sortNodes(nodes) {
  return Object.entries(nodes).sort(([, a], [, b]) => {
    if (a.__isDir && !b.__isDir) return -1;
    if (!a.__isDir && b.__isDir) return 1;
    return 0;
  });
}

function FileNode({ name, node, depth = 0, onFileClick, selectedPath }) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = Object.keys(node.__children).length > 0;
  const { icon: Icon, color } = getFileIcon(name, node.__isDir, open);
  const isSelected = !node.__isDir && selectedPath === node.__path;

  const handleClick = () => {
    if (node.__isDir) { setOpen(o => !o); return; }
    onFileClick(node.__path, name);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`file-tree-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {node.__isDir ? (
          <span className="text-[var(--text-muted)] flex-shrink-0">
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        ) : <span className="w-[13px] flex-shrink-0" />}
        <Icon size={14} color={color} className="flex-shrink-0" />
        <span className="truncate text-xs">{name}</span>
      </div>

      <AnimatePresence>
        {node.__isDir && open && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            {sortNodes(node.__children).map(([childName, childNode]) => (
              <FileNode
                key={childNode.__path}
                name={childName}
                node={childNode}
                depth={depth + 1}
                onFileClick={onFileClick}
                selectedPath={selectedPath}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FileExplorer() {
  const { state, setFileTree, openTab, setEditorContent } = useSandbox();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    if (!state.sandboxId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listFiles(state.sandboxId);
      // data might be an array of paths or an object
      const paths = Array.isArray(data) ? data : data.files ?? data.paths ?? Object.keys(data);
      setFileTree(paths);
    } catch (err) {
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [state.sandboxId, setFileTree]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleFileClick = useCallback(async (path, name) => {
    openTab(path, name);
    if (state.editorContent[path]) return; // already loaded
    try {
      const data = await readFile(state.sandboxId, path);
      const content = typeof data === 'string' ? data : data.content ?? JSON.stringify(data, null, 2);
      setEditorContent(path, content);
    } catch (err) {
      toast.error(`Failed to read ${name}: ${err.message}`);
    }
  }, [state.sandboxId, state.editorContent, openTab, setEditorContent]);

  const tree = buildTree(state.fileTree);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2">
          <FolderOpen size={14} className="text-[var(--text-accent)]" />
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Explorer</span>
        </div>
        <button
          onClick={fetchFiles}
          disabled={loading}
          className="p-1 rounded-md hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title="Refresh files"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {loading && state.fileTree.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <Loader2 size={20} className="animate-spin text-[var(--accent-bright)]" />
            <span className="text-xs text-[var(--text-muted)]">Loading files…</span>
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <p className="text-xs text-red-400 mb-3">{error}</p>
            <button onClick={fetchFiles} className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-red-500 text-[var(--text-secondary)] transition-colors">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && state.fileTree.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-[var(--text-muted)]">
            <FolderOpen size={24} />
            <span className="text-xs">No files found</span>
          </div>
        )}

        {sortNodes(tree).map(([name, node]) => (
          <FileNode
            key={node.__path}
            name={name}
            node={node}
            depth={0}
            onFileClick={handleFileClick}
            selectedPath={state.currentFile}
          />
        ))}
      </div>
    </div>
  );
}
