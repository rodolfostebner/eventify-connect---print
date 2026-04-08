import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6 text-center">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-neutral-200">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">Algo deu errado</h1>
            <p className="text-neutral-500 mb-6">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold"
            >
              Recarregar
            </button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-6 p-4 bg-red-50 text-red-600 text-xs text-left overflow-auto rounded-lg">
                {this.state.error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
