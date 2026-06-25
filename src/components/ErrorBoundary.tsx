import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Terminal, AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { logger } from '@/services/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 🛡️ NEXUS CORE - GLOBAL ERROR SHIELD
 * Optimized for 10,000+ users with remote crash harvesting.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 🛡️ Pro logging initiated - Remote Harvesting
    logger.reportError(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-xl w-full space-y-8 animate-in zoom-in duration-500">
            {/* Warning Icon Cluster */}
            <div className="relative inline-block">
                <div className="w-24 h-24 bg-rose-500/10 rounded-[2rem] flex items-center justify-center border border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.2)]">
                    <AlertTriangle className="w-12 h-12 text-rose-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 rounded-full border border-white/10 flex items-center justify-center">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                    Nexus Logic <span className="text-rose-500">Collision</span>
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] max-w-sm mx-auto">
                    The HQ interface encountered a non-linear runtime exception. All non-essential nodes have been isolated for security.
                </p>
            </div>

            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl text-left overflow-hidden">
                <p className="text-rose-400 font-mono text-xs line-clamp-2">
                    {this.state.error?.message || 'Error: Segmentation Fault in Identity Core'}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-indigo-900 transition-all shadow-xl active:scale-95"
                >
                    <RefreshCcw className="w-4 h-4" /> Restart Node
                </button>
                <button 
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 hover:text-white transition-all active:scale-95"
                >
                    <Home className="w-4 h-4" /> Return to HQ
                </button>
            </div>

            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em]">Error ID: 0xNEXUS_FALLBACK_INIT</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
