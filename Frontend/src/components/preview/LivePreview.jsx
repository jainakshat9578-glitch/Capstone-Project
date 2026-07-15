import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Monitor, RefreshCw, ExternalLink, Loader2, Globe } from 'lucide-react';
import { useSandbox } from '../../context/SandboxContext';

export default function LivePreview() {
  const { state, refreshPreview } = useSandbox();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef(null);

  const handleLoad = () => { setLoading(false); setError(false); };
  const handleError = () => { setLoading(false); setError(true); };

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setError(false);
    if (iframeRef.current) {
      iframeRef.current.src = state.previewURL;
    }
    refreshPreview();
  }, [state.previewURL, refreshPreview]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
        <Monitor size={13} className="text-[var(--text-muted)]" />
        <span className="text-xs font-medium text-[var(--text-secondary)]">Live Preview</span>

        {/* URL bar */}
        {state.previewURL && (
          <div className="flex-1 flex items-center gap-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md px-2 py-1 mx-2 min-w-0">
            <Globe size={10} className="text-[var(--text-muted)] flex-shrink-0" />
            <span className="text-[10px] font-mono text-[var(--text-muted)] truncate">{state.previewURL}</span>
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto">
          <motion.button
            onClick={handleRefresh}
            className="p-1.5 rounded-md hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Refresh preview"
            whileTap={{ scale: 0.9 }}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          </motion.button>
          {state.previewURL && (
            <a
              href={state.previewURL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 relative overflow-hidden">
        {!state.previewURL ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-muted)]">
            <Monitor size={32} className="opacity-30" />
            <p className="text-sm">Preview will appear here</p>
          </div>
        ) : (
          <>
            {/* Loading overlay */}
            {loading && (
              <motion.div
                className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg-base)]"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={24} className="animate-spin text-[var(--accent-bright)]" />
                  <span className="text-xs text-[var(--text-muted)]">Loading preview…</span>
                </div>
              </motion.div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
                <Globe size={28} className="opacity-40" />
                <p className="text-sm">Preview unavailable</p>
                <button
                  onClick={handleRefresh}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-secondary)] transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            <iframe
              ref={iframeRef}
              key={`${state.previewURL}-${state.previewRefreshKey}`}
              src={state.previewURL}
              className="w-full h-full border-none"
              title="Live Preview"
              onLoad={handleLoad}
              onError={handleError}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </>
        )}
      </div>
    </div>
  );
}
