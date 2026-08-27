import React, { StrictMode, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="p-8 max-w-md w-full bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xl">
              !
            </div>
            <h1 className="text-xl font-black uppercase tracking-wider text-white">DOGGBITE APP</h1>
            <p className="text-sm text-zinc-400">
              Ocorreu um problema ao carregar a interface. Clique abaixo para reiniciar.
            </p>
            {this.state.error && (
              <pre className="text-[11px] text-zinc-500 bg-black/50 p-3 rounded-xl w-full overflow-x-auto text-left max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-2 w-full py-3 px-4 bg-[#9eff00] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Recarregar Aplicativo
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);



