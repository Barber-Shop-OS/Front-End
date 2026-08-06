import { ReactNode } from "react";
import { Bell, Scissors, Settings } from "lucide-react";

import BookingSidebar, {
  BookingStepId,
} from "@/features/booking/components/BookingSidebar";

interface BookingLayoutProps {
  currentStep: BookingStepId;
  completedSteps?: BookingStepId[];
  onStepClick?: (stepId: BookingStepId) => void;
  children: ReactNode;
}

const BookingLayout = ({
  currentStep,
  completedSteps,
  onStepClick,
  children,
}: BookingLayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen w-full bg-white">
      <header className="flex w-full items-center justify-between border-b border-slate-100 px-6 py-4 lg:px-12">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <Scissors className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
            BarberOS
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex">
            <a href="/" className="text-blue-600">Início</a>
            <a href="/filiais" className="transition-colors hover:text-slate-900">Filiais</a>
            <a href="/servicos" className="transition-colors hover:text-slate-900">Serviços</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" aria-label="Notificações" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Configurações" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <Settings className="h-5 w-5" />
          </button>
          <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-800">
            <img src="https://i.pravatar.cc/72?img=12" alt="Avatar do usuário" className="h-full w-full object-cover" />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row lg:px-12">
        <BookingSidebar
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={onStepClick}
        />

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export default BookingLayout;