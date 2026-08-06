import type { ReactNode } from "react";

interface PageCardProps {
  children: ReactNode;
  className?: string;
}

export const PageCard = ({
  children,
  className = "",
}: PageCardProps): JSX.Element => {
  return (
    <div className={`rounded-3xl bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
};

