import type { ReactNode } from "react";

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  accent = false,
  className = "",
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  accent?: boolean;
  className?: string;
}) => (
  <div
    className={`rounded-3xl p-5 shadow-sm ${
      accent ? "bg-[#0b4bd8] text-white" : "bg-white"
    } ${className}`}
  >
    <div className="mb-4 flex items-center justify-between">
      <div className="text-sm font-semibold uppercase tracking-[0.15em] opacity-70">
        {title}
      </div>
      {icon}
    </div>
    <div className="text-4xl font-black tracking-tight">{value}</div>
    {subtitle ? (
      <div className="mt-2 text-sm opacity-80">{subtitle}</div>
    ) : null}
  </div>
);

export const SectionCard = ({
  title,
  subtitle,
  children,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) => (
  <section className={`rounded-3xl bg-white p-6 shadow-sm ${className}`}>
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
    {children}
  </section>
);
