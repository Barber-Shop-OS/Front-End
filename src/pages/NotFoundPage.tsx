import { Link } from "react-router-dom";

const NotFoundPage = (): JSX.Element => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="mt-2 text-slate-600">Pagina nao encontrada.</p>
      <Link
        to="/"
        className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Voltar para o inicio
      </Link>
    </main>
  );
};

export default NotFoundPage;
