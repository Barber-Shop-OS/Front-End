import { Link, useParams } from "react-router-dom";
import { CalendarDays, Plus, ArrowLeft } from "lucide-react";

import AppLayout from "@/layouts/AppLayout";

/**
 * Página placeholder do fluxo de agendamento.
 *
 * A rota já está registrada em `publicRoutes.tsx`:
 * - `/agendar` (agendamento genérico)
 * - `/b/:slug/agendar` (agendamento direto de uma barbearia)
 *
 * TODO: substituir este placeholder por uma página de agendamento real
 * quando o fluxo estiver implementado.
 */
const AppointmentFlowPage = (): JSX.Element => {
  const { slug } = useParams();

  return (
    <AppLayout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center lg:px-12">
        <Link
          to={slug ? `/b/${slug}` : "/filiais"}
          className="flex items-center gap-2 self-start text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <CalendarDays className="h-8 w-8" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {slug ? `Agendar na barbearia` : "Novo Agendamento"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-slate-500">
            O fluxo completo de agendamento está em construção. Em breve você
            poderá escolher filial, serviço, profissional e horário aqui mesmo.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
            Escolher filial
          </span>
          <Plus className="h-4 w-4 text-slate-400" />
          <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
            Escolher serviço
          </span>
          <Plus className="h-4 w-4 text-slate-400" />
          <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
            Escolher horário
          </span>
        </div>

        <Link
          to="/signup"
          className="mt-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Criar conta para agendar
        </Link>
      </div>
    </AppLayout>
  );
};

export default AppointmentFlowPage;
