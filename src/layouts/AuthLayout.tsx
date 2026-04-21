import type { PropsWithChildren } from "react";

const AuthLayout = ({ children }: PropsWithChildren): JSX.Element => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 px-4 py-12">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 md:p-10">
        {children}
      </div>
    </main>
  );
};

export default AuthLayout;
