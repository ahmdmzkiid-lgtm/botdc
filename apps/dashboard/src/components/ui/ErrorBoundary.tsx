import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Terjadi Kesalahan</h1>
            <p className="text-gray-400 text-sm mb-6">{this.state.error?.message || 'Terjadi kesalahan yang tidak terduga'}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
