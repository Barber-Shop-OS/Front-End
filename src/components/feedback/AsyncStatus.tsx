import { Link } from "react-router-dom";

import FullScreenLoader from "@/components/FullScreenLoader";
import type { ApiError } from "@/services/http";

interface AsyncStatusProps {
  loading: boolean;
  error: ApiError | null;
  notFoundMessage?: string;
}

/**
 * Estado de carregamento/erro padrão das páginas que buscam dados da API.
 * Retorna `null` quando os dados já estão prontos.
 */
const AsyncStatus = ({
  loading,
  error,
  notFoundMessage = "Não encontramos o que você procurava.",
}: AsyncStatusProps): JSX.Element | null => {
  if (loading) return <FullScreenLoader />;
  if (!error) return null;

  const message =
    error.status === 404
      ? notFoundMessage
      : "Não foi possível carregar os dados agora. Tente novamente em instantes.";

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg font-semibold text-slate-800">{message}</p>
      <Link to="/filiais" className="font-semibold text-blue-700 hover:text-blue-800">
        Buscar barbearias
      </Link>
    </div>
  );
};

export default AsyncStatus;

/** Mensagem de lista vazia. */
export const EmptyState = ({ message }: { message: string }): JSX.Element => (
  <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">{message}</p>
);
