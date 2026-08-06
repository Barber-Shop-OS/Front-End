import { ArrowRight } from "lucide-react";

interface BookingSummaryBarProps {
  label: string;
  summary: string;
  ctaLabel?: string;
  disabled?: boolean;
  onNext?: () => void;
}

const BookingSummaryBar = ({
  label,
  summary,
  ctaLabel = "Próximo Passo",
  disabled = false,
  onNext,
}: BookingSummaryBarProps): JSX.Element => {
  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-slate-50 p-6 sm:flex-row sm:items-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-700">{summary}</p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onNext}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default BookingSummaryBar;