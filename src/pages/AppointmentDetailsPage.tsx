import { CheckCircle2, MapPin, MoreVertical, Navigation, Clock3, CalendarDays, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import CustomerLayout from "@/layouts/CustomerLayout";

const AppointmentDetailsPage = (): JSX.Element => {
  const { appointmentId } = useParams();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-4xl space-y-10 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/cliente/agendamentos" className="text-3xl font-bold text-slate-900">
            ← Detalhes do Agendamento
          </Link>
          <button type="button" className="text-slate-400">
            <MoreVertical className="h-6 w-6" />
          </button>
        </div>

        <section className="rounded-2xl bg-[#eef3ff] p-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#dce6ff] px-4 py-2 font-semibold text-slate-800">
            <CheckCircle2 className="h-4 w-4 text-[#0b4bd8]" />
            Confirmado
          </span>
          <h2 className="mt-6 text-2xl font-bold">Terça, 24 de Out</h2>
          <p className="mt-4 text-2xl text-slate-600">14:30 - 15:30</p>
          <p className="mt-3 text-sm text-slate-400">Agendamento #{appointmentId}</p>
        </section>

        <section className="grid gap-10 md:grid-cols-2">
          <div className="flex items-start gap-4">
            <img
              src="https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=160&q=80"
              alt=""
              className="h-16 w-16 rounded-2xl object-cover"
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Com o especialista</p>
              <h3 className="mt-2 text-2xl font-bold">Rafael Costa</h3>
              <p className="mt-1 text-slate-500">★ 4.9 (120 avaliações)</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Serviço agendado</p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">Corte e Barba Clássica</h3>
                <p className="mt-2 flex items-center gap-2 text-slate-500">
                  <Clock3 className="h-4 w-4" />
                  60 min
                </p>
              </div>
              <span className="text-2xl font-bold text-[#0b4bd8]">R$ 120</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold uppercase tracking-[0.06em] text-slate-600">Localização</h3>
          <div className="mt-5 flex items-start gap-4">
            <div className="rounded-xl bg-[#eef3ff] p-3 text-[#0b4bd8]">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold">BarberOS - Unidade Paulista</h4>
              <p className="mt-1 text-slate-500">
                Av. Paulista, 1578 - Bela Vista
                <br />
                São Paulo - SP
              </p>
              <button type="button" className="mt-4 flex items-center gap-2 font-semibold text-[#0b4bd8]">
                <Navigation className="h-4 w-4" />
                Abrir no Mapa
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[#eef3ff] p-6">
          <div className="space-y-4">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#a7b9ff] px-6 py-4 font-bold text-slate-700"
            >
              <CalendarDays className="h-5 w-5" />
              Reagendar Horário
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 font-bold text-red-600"
            >
              <XCircle className="h-5 w-5" />
              Cancelar Agendamento
            </button>
          </div>
        </section>

        <div className="flex gap-3 md:hidden">
          <button type="button" className="flex-1 rounded-xl bg-[#0b4bd8] px-4 py-3 font-semibold text-white">
            Reagendar
          </button>
          <button type="button" className="flex-1 rounded-xl bg-white px-4 py-3 font-semibold text-red-600">
            Cancelar
          </button>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default AppointmentDetailsPage;
