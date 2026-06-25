import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/services/logger';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 🛡️ Pro logging initiated
    logger.reportError(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">
              Nexus Fault Detected
            </h1>
            
            <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">
              A transmission error occurred in the core logic. The crash report has been transmitted to our control center for analysis.
            </p>

            <div className="space-y-4">
              <button
                onClick={this.handleReset}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95"
              >
                <RefreshCcw className="w-4 h-4" />
                Reload Portal
              </button>
              
              <a
                href="/"
                className="w-full py-5 bg-white text-slate-900 border border-slate-200 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
              >
                <Home className="w-4 h-4" />
                Return Home
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-12 p-6 bg-slate-50 rounded-2xl text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-red-600 break-all">
                  {this.state.error?.stack}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
