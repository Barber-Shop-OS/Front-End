import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

export interface SidebarNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  activeClassName?: string;
  inactiveClassName?: string;
  iconActiveClassName?: string;
  iconInactiveClassName?: string;
  labelActiveClassName?: string;
  labelInactiveClassName?: string;
  itemClassName?: string;
}

export const SidebarNav = ({
  items,
  activeClassName = "bg-white text-[#0b4bd8] shadow-sm",
  inactiveClassName = "text-slate-600 hover:bg-white/70",
  iconActiveClassName = "text-[#0b4bd8]",
  iconInactiveClassName = "text-slate-500",
  labelActiveClassName = "font-bold text-[#0b4bd8]",
  labelInactiveClassName = "font-medium text-slate-600",
  itemClassName = "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
}: SidebarNavProps): JSX.Element => {
  return (
    <nav className="space-y-2">
      {items.map(({ label, icon: Icon, to }) => (
        <NavLink
          key={label}
          to={to}
          end={to === "/dashboard"}
          className={({ isActive }) =>
            `${itemClassName} ${isActive ? activeClassName : inactiveClassName}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className={`h-4 w-4 ${isActive ? iconActiveClassName : iconInactiveClassName}`}
              />
              <span
                className={
                  isActive ? labelActiveClassName : labelInactiveClassName
                }
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

