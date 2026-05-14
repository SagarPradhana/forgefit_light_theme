import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-white p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(232,82,26,0.03)_0%,transparent_100%)]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-amber-200/60 bg-white p-8 md:p-12 text-center shadow-[0_25px_80px_rgba(0,0,0,0.08),0_8px_32px_rgba(232,82,26,0.06)]"
          >
            <div className="mx-auto mb-8 h-24 w-24 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center">
              <AlertTriangle size={48} className="text-red-500" />
            </div>

            <h1 className="mb-4 text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              Something went wrong
            </h1>

            <p className="mb-10 text-sm font-medium text-gray-500 leading-relaxed max-w-md mx-auto">
              We encountered an unexpected error. Please try again or return to the home page.
            </p>

            <div className="mb-10 rounded-2xl bg-orange-50 border border-orange-200 p-4 text-left">
              <p className="text-[10px] font-mono text-gray-500 uppercase mb-2 font-semibold">Error:</p>
              <p className="text-xs font-mono text-red-600 truncate font-medium">
                {this.state.error?.message || "Unknown Runtime Exception"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={this.handleReset}
                className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] px-8 py-4 font-bold uppercase tracking-widest text-white transition-all active:scale-95"
                style={{ boxShadow: "0 4px 20px rgba(232,82,26,0.3)" }}
              >
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                Try Again
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 font-bold uppercase tracking-widest text-gray-600 border border-amber-200 transition-all hover:border-amber-300 hover:text-gray-800"
              >
                <Home size={18} />
                Go Home
              </button>
            </div>

            <div className="mt-12 flex flex-col items-center gap-2">
              <div className="h-1 w-12 rounded-full bg-amber-200" />
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.5em]">ForgeFit Recovery Protocol</p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;