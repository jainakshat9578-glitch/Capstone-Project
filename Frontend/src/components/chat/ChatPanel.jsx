import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Square, User, Sparkles, Clock,
  CheckCircle2, Loader2, AlertCircle, ChevronDown
} from 'lucide-react';
import { useSandbox } from '../../context/SandboxContext';
import { invokeAI } from '../../services/api';
import toast from 'react-hot-toast';

// ── Event timeline item ────────────────────────────────────────
function EventItem({ text, status }) {
  return (
    <div className="event-item">
      <span className={`event-dot ${status}`} />
      <div className="flex-1">
        <span className="text-xs">{text}</span>
      </div>
    </div>
  );
}

// ── Typing indicator ───────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      {[0, 1, 2].map(i => (
        <div key={i} className="typing-dot" />
      ))}
    </div>
  );
}

// ── Chat bubble ────────────────────────────────────────────────
function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="px-4 py-2">
        <div className="border border-[var(--border)] rounded-xl p-3 bg-[var(--bg-elevated)]">
          <div className="text-xs text-[var(--text-muted)] mb-2 flex items-center gap-1">
            <Clock size={10} />
            <span>Event Timeline</span>
          </div>
          {message.events?.map((ev, i) => (
            <EventItem key={i} text={ev.text} status={ev.status} />
          ))}
          {message.streaming && <TypingIndicator />}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`flex gap-3 px-4 py-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
        isUser ? 'gradient-bg' : 'bg-[var(--bg-elevated)] border border-[var(--border)]'
      }`}>
        {isUser ? <User size={13} className="text-white" /> : <Sparkles size={13} className="text-[var(--text-accent)]" />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[88%] ${isUser ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] text-[var(--text-muted)] px-1">
          {isUser ? 'You' : 'AI Assistant'} · {message.timestamp}
        </span>
        <div className={`chat-bubble ${isUser ? 'user' : 'assistant'}`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-chat text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content || ''}
              </ReactMarkdown>
              {message.streaming && (
                <span className="inline-block w-1.5 h-4 bg-[var(--accent-bright)] animate-pulse rounded-sm ml-0.5 align-middle" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Chat Input ─────────────────────────────────────────────────
function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    textareaRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [value]);

  return (
    <div className="border-t border-[var(--border)] bg-[var(--bg-surface)] p-3">
      <div className="flex items-end gap-2 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] focus-within:border-[var(--accent)] transition-colors p-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={disabled ? 'AI is thinking…' : 'Ask AI to build, modify, or explain…'}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none outline-none py-1 px-1 leading-relaxed disabled:opacity-60"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
        <motion.button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed"
          whileTap={{ scale: 0.92 }}
        >
          <Send size={14} />
        </motion.button>
      </div>
      <p className="text-[10px] text-[var(--text-muted)] mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
    </div>
  );
}

// ── Main Chat Panel ────────────────────────────────────────────
export default function ChatPanel() {
  const { state, addChatMessage, updateChatMessage, setGenerating } = useSandbox();
  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const uid = useId();
  let msgCounter = useRef(0);

  const scrollToBottom = useCallback(() => {
    if (autoScroll) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [autoScroll]);

  useEffect(() => { scrollToBottom(); }, [state.chatMessages, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAutoScroll(nearBottom);
  };

  const handleStopGeneration = () => {
    abortRef.current?.abort();
    setGenerating(false);
  };

  const handleSend = useCallback(async (text) => {
    if (state.isGenerating) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `${uid}-user-${++msgCounter.current}`;
    const aiMsgId   = `${uid}-ai-${++msgCounter.current}`;
    const sysId     = `${uid}-sys-${++msgCounter.current}`;

    addChatMessage({ id: userMsgId, role: 'user', content: text, timestamp: now });
    addChatMessage({ id: aiMsgId, role: 'assistant', content: '', streaming: true, timestamp: now });
    addChatMessage({ id: sysId, role: 'system', events: [], streaming: true, timestamp: now });

    setGenerating(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await invokeAI(text, state.sandboxId, controller.signal);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      let events = [];
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Process SSE lines
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // keep last incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith('data:')) {
            const rawData = line.slice(5).trim();
            if (rawData === '[DONE]') break;
            try {
              const parsed = JSON.parse(rawData);
              // Delta content
              const delta = parsed.choices?.[0]?.delta?.content
                ?? parsed.content
                ?? parsed.delta
                ?? parsed.text
                ?? '';
              if (delta) {
                aiContent += delta;
                updateChatMessage(aiMsgId, { content: aiContent, streaming: true });
              }
              // Events
              if (parsed.event || parsed.type) {
                const evText = parsed.event ?? parsed.type ?? parsed.message ?? '';
                const evStatus = evText.toLowerCase().includes('success') ? 'done' : 'pending';
                events = [...events, { text: evText, status: evStatus }];
                updateChatMessage(sysId, { events, streaming: true });
              }
            } catch {
              // Plain text SSE
              if (rawData && rawData !== '[DONE]') {
                aiContent += rawData;
                updateChatMessage(aiMsgId, { content: aiContent, streaming: true });
              }
            }
          } else if (line.startsWith('event:')) {
            const evText = line.slice(6).trim();
            const evStatus = evText.toLowerCase().includes('success') || evText.toLowerCase().includes('done') ? 'done' : 'pending';
            events = [...events, { text: evText, status: evStatus }];
            updateChatMessage(sysId, { events, streaming: true });
          }
        }
      }

      updateChatMessage(aiMsgId, { content: aiContent || '*(no response)*', streaming: false });
      updateChatMessage(sysId, {
        events: events.map(e => ({ ...e, status: 'done' })),
        streaming: false
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        updateChatMessage(aiMsgId, { content: aiContent => aiContent + '\n\n*Generation stopped.*', streaming: false });
      } else {
        updateChatMessage(aiMsgId, { content: `⚠️ Error: ${err.message}`, streaming: false });
        toast.error('AI request failed');
      }
      updateChatMessage(sysId, { events, streaming: false });
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }, [state.isGenerating, state.sandboxId, addChatMessage, updateChatMessage, setGenerating, uid]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">AI Assistant</span>
        </div>
        {state.isGenerating && (
          <motion.button
            onClick={handleStopGeneration}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Square size={11} />
            Stop
          </motion.button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-3 space-y-1"
      >
        {state.chatMessages.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Ask AI to build</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Describe what you want to create, and the AI will write, modify, and run code in your sandbox.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
              {[
                'Create a React counter app',
                'Add a dark mode toggle',
                'Fix the CSS layout',
              ].map(hint => (
                <button
                  key={hint}
                  onClick={() => handleSend(hint)}
                  className="text-left text-xs px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-accent)] transition-all"
                >
                  → {hint}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {state.chatMessages.map(msg => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {state.isGenerating && (
          <div className="px-4 py-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Loader2 size={12} className="animate-spin text-[var(--accent-bright)]" />
            <span>AI is thinking…</span>
          </div>
        )}
      </div>

      {/* Scroll to bottom */}
      <AnimatePresence>
        {!autoScroll && (
          <motion.button
            className="absolute bottom-24 right-6 w-8 h-8 rounded-full glass border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] shadow-lg"
            onClick={() => { setAutoScroll(true); scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <ChevronDown size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      <ChatInput onSend={handleSend} disabled={state.isGenerating} />
    </div>
  );
}
