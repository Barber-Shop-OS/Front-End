import DashboardLayout from "@/layouts/DashboardLayout";
import { useAppSelector } from "@/hooks/redux";

const DashboardPage = (): JSX.Element => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <DashboardLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Bem-vindo, <strong>{user?.name ?? "usuario"}</strong>.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Esse e o ponto inicial para os modulos do SaaS.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
