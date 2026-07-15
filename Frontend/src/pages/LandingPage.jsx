import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Code2, Cpu, ArrowRight, Sparkles } from 'lucide-react';
import { startSandbox } from '../services/api';
import { useSandbox } from '../context/SandboxContext';

const FEATURES = [
  { icon: Cpu,      label: 'AI-Powered',   desc: 'GPT-level code generation' },
  { icon: Code2,    label: 'Live Preview',  desc: 'Real-time browser preview' },
  { icon: Zap,      label: 'Instant Start', desc: 'Zero-config sandbox' },
];

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 3,
  duration: Math.random() * 4 + 3,
}));

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setSandbox, setSandboxStatus } = useSandbox();
  const navigate = useNavigate();

  const handleStart = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSandboxStatus('creating');
    try {
      const data = await startSandbox();
      setSandbox(data.sandboxId, data.previewURL);
      navigate('/ide');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to start sandbox');
      setSandboxStatus('error');
    } finally {
      setLoading(false);
    }
  }, [setSandbox, setSandboxStatus, navigate]);

  return (
    <div className="landing-bg relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* Animated background particles */}
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-500 opacity-20 pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Glow orbs */}
      <div className="landing-orb w-[600px] h-[600px] opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.6) 0%, transparent 70%)', top: '-150px', left: '20%' }} />
      <div className="landing-orb w-[400px] h-[400px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.7) 0%, transparent 70%)', bottom: '-100px', right: '15%' }} />

      {/* Top navbar */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center px-8 glass border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
            Code<span className="gradient-text">Sandbox</span> AI
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)] px-3 py-1.5 rounded-full border border-[var(--border)] glass">
            v1.0 · Beta
          </span>
        </div>
      </div>

      {/* Main hero */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-[var(--border)] mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-[var(--text-secondary)]">AI Sandbox is live</span>
          </motion.div>

          {/* Heading */}
          <h1 className="text-6xl font-extrabold leading-tight mb-5 tracking-tight">
            <span className="text-[var(--text-primary)]">Build Apps with</span>
            <br />
            <span className="gradient-text">AI in Seconds</span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-10 max-w-xl mx-auto">
            A full-stack AI development environment. Describe your idea, watch AI write, run,
            and preview your code — all in the browser.
          </p>

          {/* CTA */}
          <motion.button
            className="btn-primary inline-flex items-center gap-3 text-base"
            onClick={handleStart}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Initializing Sandbox…</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Start Sandbox</span>
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mt-5 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Feature chips */}
        <motion.div
          className="flex items-center gap-4 mt-14 flex-wrap justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="glass rounded-2xl px-5 py-4 flex items-center gap-3 border border-[var(--border)] min-w-[160px]">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-[var(--text-accent)]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
                <div className="text-xs text-[var(--text-muted)]">{desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mb-6 shadow-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles size={32} className="text-white" />
            </motion.div>
            <p className="text-xl font-semibold text-[var(--text-primary)] mb-2">Creating your sandbox…</p>
            <p className="text-sm text-[var(--text-muted)]">Spinning up a fresh environment just for you</p>
            <div className="flex gap-2 mt-6">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[var(--accent-bright)]"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
