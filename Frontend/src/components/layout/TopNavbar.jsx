import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Sun, Moon, Wifi, WifiOff, Loader2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useSandbox } from '../../context/SandboxContext';
import { restartSandbox } from '../../services/api';
import toast from 'react-hot-toast';

export default function TopNavbar() {
  const { state, toggleTheme, resetSandbox, setFileTree, setSandboxStatus } = useSandbox();
  const [restarting, setRestarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const statusColor = {
    connected: 'bg-green-400',
    disconnected: 'bg-red-400',
    reconnecting: 'bg-yellow-400',
  }[state.socketStatus] ?? 'bg-gray-500';

  const handleRestart = useCallback(async () => {
    if (restarting) return;
    setRestarting(true);
    try {
      await restartSandbox(state.sandboxId);
      setFileTree([]);
      toast.success('Sandbox restarted');
    } catch {
      toast.error('Restart failed');
    } finally {
      setRestarting(false);
    }
  }, [restarting, state.sandboxId, setFileTree]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(state.sandboxId ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoClick = () => {
    resetSandbox();
    navigate('/');
  };

  return (
    <header className="navbar">
      {/* Logo */}
      <button onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer group shrink-0">
        <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center shadow-md group-hover:shadow-[var(--shadow-glow)] transition-shadow">
          <Sparkles size={14} className="text-white" />
        </div>
        <span className="font-bold text-sm tracking-tight text-[var(--text-primary)] hidden sm:block">
          Code<span className="gradient-text">Sandbox</span>
        </span>
      </button>

      <div className="w-px h-5 bg-[var(--border)] mx-1 hidden sm:block" />

      {/* Sandbox ID */}
      {state.sandboxId && (
        <motion.button
          onClick={handleCopyId}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-accent)] transition-all truncate max-w-[200px]"
          title="Click to copy sandbox ID"
          whileTap={{ scale: 0.97 }}
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          <span className="hidden sm:inline truncate">{state.sandboxId}</span>
          <span className="sm:hidden">Sandbox</span>
        </motion.button>
      )}

      {/* Connection status */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[var(--bg-elevated)] border border-[var(--border)] capitalize text-[var(--text-secondary)]">
        <span className={`w-2 h-2 rounded-full ${statusColor} ${state.socketStatus === 'reconnecting' ? 'animate-pulse' : ''}`} />
        <span className="hidden sm:inline">{state.socketStatus}</span>
        {state.socketStatus === 'connected' ? <Wifi size={12} /> : <WifiOff size={12} className="text-[var(--text-muted)]" />}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Restart */}
        <motion.button
          onClick={handleRestart}
          disabled={restarting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-accent)] transition-all disabled:opacity-50"
          whileTap={{ scale: 0.95 }}
          title="Restart sandbox"
        >
          {restarting
            ? <Loader2 size={13} className="animate-spin" />
            : <RefreshCw size={13} />}
          <span className="hidden sm:inline">Restart</span>
        </motion.button>

        {/* Theme toggle */}
        <motion.button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-accent)] transition-all"
          whileTap={{ scale: 0.9 }}
          title="Toggle theme"
        >
          {state.theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </motion.button>
      </div>
    </header>
  );
}
