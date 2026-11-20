// Layout das telas de entrada (login, cadastro, recuperação de senha).
import { Outlet } from 'react-router-dom';
import { CalendarCheck, Scissors, Smartphone } from 'lucide-react';

import { Logo } from '@/components/Logo';

export const AuthLayout = () => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <div className="flex flex-col px-4 py-6 sm:px-8">
      <Logo />
      <div className="flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900 p-12 text-white lg:flex lg:flex-col lg:justify-center">
      <h2 className="max-w-md text-4xl font-black leading-tight">Agenda cheia, cadeira girando.</h2>
      <p className="mt-4 max-w-md text-lg text-primary-100">O sistema da sua barbearia: agendamento online, lembretes automáticos e financeiro no mesmo lugar.</p>
      <ul className="mt-10 space-y-4 text-primary-50">
        <li className="flex items-center gap-3">
          <CalendarCheck className="h-6 w-6" aria-hidden="true" /> Clientes agendam 24 h pelo celular
        </li>
        <li className="flex items-center gap-3">
          <Smartphone className="h-6 w-6" aria-hidden="true" /> Lembretes por e-mail reduzem faltas
        </li>
        <li className="flex items-center gap-3">
          <Scissors className="h-6 w-6" aria-hidden="true" /> Barbeiros, serviços e filiais organizados
        </li>
      </ul>
    </aside>
  </div>
);

export default AuthLayout;
