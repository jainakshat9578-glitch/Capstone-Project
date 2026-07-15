import { useEffect, useRef, useCallback } from 'react';
import { Terminal as TerminalIcon, Wifi, WifiOff, Maximize2, Trash2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { useSandbox } from '../../context/SandboxContext';
import { motion } from 'framer-motion';

export default function TerminalPanel() {
  const { state, setSocketStatus } = useSandbox();
  const terminalDivRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const initializedRef = useRef(false);

  const initTerminal = useCallback(async () => {
    if (!terminalDivRef.current || initializedRef.current) return;
    initializedRef.current = true;

    const { Terminal } = await import('@xterm/xterm');
    const { FitAddon } = await import('@xterm/addon-fit');
    await import('@xterm/xterm/css/xterm.css');

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: "'JetBrains Mono', 'Fira Code', Cascadia Code, monospace",
      fontSize: 13,
      lineHeight: 1.5,
      theme: {
        background: '#0d0d12',
        foreground: '#e0e0f0',
        cursor: '#a78bfa',
        cursorAccent: '#0d0d12',
        selectionBackground: 'rgba(124,58,237,0.3)',
        black:   '#1a1a2e', red:    '#ff6b6b', green:  '#4ade80', yellow: '#fbbf24',
        blue:    '#60a5fa', magenta:'#a78bfa', cyan:   '#22d3ee', white:  '#e0e0f0',
        brightBlack:  '#4a4a6a', brightRed:   '#ff8080', brightGreen: '#6ee7a0',
        brightYellow: '#fcd34d', brightBlue:  '#93c5fd', brightMagenta:'#c4b5fd',
        brightCyan:   '#67e8f9', brightWhite: '#f0f0ff',
      },
      scrollback: 1000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalDivRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[1;35m╭─────────────────────────────────────────╮\x1b[0m');
    term.writeln('\x1b[1;35m│\x1b[0m  \x1b[1;36mCodeSandbox AI\x1b[0m \x1b[2mTerminal\x1b[0m                \x1b[1;35m│\x1b[0m');
    term.writeln('\x1b[1;35m╰─────────────────────────────────────────╯\x1b[0m');
    term.writeln('');

    // Connect socket
    const socketURL = `http://${state.sandboxId}.agent.localhost`;
    const socket = io(socketURL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketStatus('connected');
      term.writeln('\x1b[32m● Connected to sandbox\x1b[0m');
      term.writeln('');
    });

    socket.on('disconnect', () => {
      setSocketStatus('disconnected');
      term.writeln('\x1b[33m● Disconnected. Reconnecting…\x1b[0m');
    });

    socket.on('connect_error', () => {
      setSocketStatus('reconnecting');
    });

    socket.on('reconnect', () => {
      setSocketStatus('connected');
      term.writeln('\x1b[32m● Reconnected\x1b[0m');
    });

    socket.on('terminal-output', (data) => {
      term.write(data);
    });

    // Handle user input
    term.onData((data) => {
      socket.emit('terminal-input', data);
    });

    // Resize observer
    const ro = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch {}
    });
    ro.observe(terminalDivRef.current);

    return () => {
      ro.disconnect();
      term.dispose();
      socket.disconnect();
    };
  }, [state.sandboxId, setSocketStatus]);

  useEffect(() => {
    let cleanup;
    initTerminal().then(fn => { cleanup = fn; });
    return () => {
      cleanup?.();
      initializedRef.current = false;
    };
  }, [initTerminal]);

  const handleClear = () => { xtermRef.current?.clear(); };

  const statusColor = {
    connected: 'text-green-400',
    disconnected: 'text-red-400',
    reconnecting: 'text-yellow-400',
  }[state.socketStatus] ?? 'text-gray-500';

  return (
    <div className="flex flex-col h-full" style={{ background: '#0d0d12' }}>
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1e1e2e] bg-[#111118] shrink-0">
        <TerminalIcon size={13} className="text-[#5a5a7a]" />
        <span className="text-xs font-medium text-[#5a5a7a]">Terminal</span>
        <div className={`flex items-center gap-1 ml-2 ${statusColor}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="text-[10px] capitalize">{state.socketStatus}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="p-1 rounded hover:bg-[#1e1e2e] text-[#5a5a7a] hover:text-[#9898b8] transition-colors"
            title="Clear terminal"
          >
            <Trash2 size={12} />
          </button>
          <button
            onClick={() => { try { fitAddonRef.current?.fit(); } catch {} }}
            className="p-1 rounded hover:bg-[#1e1e2e] text-[#5a5a7a] hover:text-[#9898b8] transition-colors"
            title="Fit terminal"
          >
            <Maximize2 size={12} />
          </button>
        </div>
      </div>

      {/* xterm.js container */}
      <div ref={terminalDivRef} className="flex-1 overflow-hidden p-1" style={{ minHeight: 0 }} />
    </div>
  );
}
