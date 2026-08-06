import { CalendarClock, CheckCircle2, CreditCard, Scissors, User } from "lucide-react";

export type BookingStepId = "barbeiro" | "horario" | "servico" | "pagamento";

interface BookingStepConfig {
  id: BookingStepId;
  label: string;
  icon: typeof User;
}

const steps: BookingStepConfig[] = [
  { id: "barbeiro", label: "Barbeiro", icon: User },
  { id: "horario", label: "Horário", icon: CalendarClock },
  { id: "servico", label: "Serviço", icon: Scissors },
  { id: "pagamento", label: "Pagamento", icon: CreditCard },
];

interface BookingSidebarProps {
  currentStep: BookingStepId;
  completedSteps?: BookingStepId[];
  onStepClick?: (stepId: BookingStepId) => void;
}

const BookingSidebar = ({
  currentStep,
  completedSteps = [],
  onStepClick,
}: BookingSidebarProps): JSX.Element => {
  return (
    <aside className="h-fit w-full shrink-0 rounded-2xl bg-slate-50 p-6 lg:w-72">
      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-blue-600">Reserva</h2>
        <p className="text-xs text-slate-400">Precisão BarberOS</p>
      </div>

      <nav className="flex flex-col gap-1">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick?.(step.id)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:bg-white/60"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {step.label}
              </span>
              {isCompleted && !isActive && (
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default BookingSidebar;