import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

import { useAppDispatch } from "@/hooks/redux";
import { logout } from "@/features/auth/slices/authSlice";

const DashboardLayout = ({ children }: PropsWithChildren): JSX.Element => {
  const dispatch = useAppDispatch();

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/dashboard" className="text-lg font-bold text-slate-900">
            SaaS Console
          </Link>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            onClick={() => dispatch(logout())}
          >
            Sair
          </button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        {children}
      </section>
    </main>
  );
};

export default DashboardLayout;
