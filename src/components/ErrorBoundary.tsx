// FE-34: erro de renderização não deixa tela branca — mostra opção de recarregar.
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Sem serviço de monitoramento configurado: fica no console do navegador.
    console.error('Erro na interface', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-xl font-black text-slate-900">Algo deu errado</h1>
          <p className="mt-2 text-sm text-slate-600">Recarregue a página. Se o problema continuar, fale com o suporte.</p>
          <button type="button" className="mt-6 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white" onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}
