import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function isChunkError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed') ||
    error.message.includes('error loading dynamically imported module')
  );
}

/**
 * Catches React lazy() chunk load failures that happen when the browser
 * has a stale HTML referencing old Vite asset hashes after a new deploy.
 *
 * On chunk error → auto-reload once.
 * On any other error → show a friendly fallback with a manual reload button.
 */
export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    if (isChunkError(error)) {
      // Reload immediately — the new HTML + chunks will load correctly.
      window.location.reload();
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '1rem',
            fontFamily: 'sans-serif',
            color: '#333',
          }}
        >
          <h2 style={{ margin: 0 }}>Algo deu errado</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            {this.state.error?.message ?? 'Erro inesperado na aplicação.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
