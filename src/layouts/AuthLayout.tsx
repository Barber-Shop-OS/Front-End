import type { PropsWithChildren } from "react";

const AuthLayout = ({ children }: PropsWithChildren): JSX.Element => {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen w-full items-stretch justify-center">
        {children}
      </div>
    </main>
  );
};

export default AuthLayout;
