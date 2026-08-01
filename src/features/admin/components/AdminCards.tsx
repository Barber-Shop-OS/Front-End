import type { ReactNode } from "react";
import { PageCard } from "@/components/ui/PageCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

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
  <PageCard
    className={`p-5 ${
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
  </PageCard>
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
    <SectionHeader title={title} subtitle={subtitle} action={action} />
    {children}
  </section>
);
