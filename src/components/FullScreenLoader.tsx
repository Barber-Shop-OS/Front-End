/**
 * Loader em tela cheia usado durante o bootstrap de sessão
 * e verificações de autenticação dos guards.
 */
const FullScreenLoader = (): JSX.Element => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
      <div
        className="flex flex-col items-center gap-3"
        role="status"
        aria-live="polite"
      >
        <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="text-sm font-medium text-slate-500">
          Carregando...
        </span>
      </div>
    </div>
  );
};

export default FullScreenLoader;
