import { Bell, HelpCircle } from "lucide-react";

interface TopBarProps {
  label: string;
  avatarUrl?: string;
  avatarAlt?: string;
}

export const TopBar = ({
  label,
  avatarUrl = "https://placehold.co/40x40",
  avatarAlt = "Avatar do usuário",
}: TopBarProps): JSX.Element => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur lg:px-8">
      <div className="text-sm font-semibold text-[#0b4bd8]">{label}</div>
      <div className="flex items-center gap-3">
        <button type="button" className="text-slate-500">
          <Bell className="h-5 w-5" />
        </button>
        <button type="button" className="text-slate-500">
          <HelpCircle className="h-5 w-5" />
        </button>
        <img className="h-10 w-10 rounded-full object-cover" src={avatarUrl} alt={avatarAlt} />
      </div>
    </header>
  );
};

