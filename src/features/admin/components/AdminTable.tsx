import type { ReactNode } from "react";

type Column = { label: string; className?: string };

export const AdminTable = ({
  columns,
  rows,
  className = "",
}: {
  columns: Column[];
  rows: ReactNode[];
  className?: string;
}) => (
  <div
    className={`overflow-hidden rounded-2xl bg-white shadow-sm ${className}`}
  >
    <div
      className="grid border-b border-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500"
      style={{
        gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
      }}
    >
      {columns.map((column) => (
        <div key={column.label} className={column.className}>
          {column.label}
        </div>
      ))}
    </div>
    <div className="divide-y divide-slate-100">{rows}</div>
  </div>
);
