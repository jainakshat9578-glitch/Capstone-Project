import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { SandboxProvider, useSandbox } from './context/SandboxContext';
import LandingPage from './pages/LandingPage';
import IDEPage from './pages/IDEPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 30_000 } }
});

// Sync theme CSS class to <html>
function ThemeSync() {
  const { state } = useSandbox();
  useEffect(() => {
    document.documentElement.className = state.theme;
  }, [state.theme]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SandboxProvider>
        <ThemeSync />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/ide" element={<IDEPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '13px',
              boxShadow: 'var(--shadow-lg)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: 'var(--bg-elevated)' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: 'var(--bg-elevated)' } },
          }}
        />
      </SandboxProvider>
    </QueryClientProvider>
  );
}
