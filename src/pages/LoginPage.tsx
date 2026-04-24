import LoginAccessPanel from "@/features/auth/components/LoginAccessPanel";
import LoginHeroPanel from "@/features/auth/components/LoginHeroPanel";
import AuthLayout from "@/layouts/AuthLayout";

const LoginPage = (): JSX.Element => {
  return (
    <AuthLayout>
      <section className="grid min-h-screen w-full overflow-hidden bg-slate-50 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <LoginHeroPanel />
        <LoginAccessPanel />
      </section>
    </AuthLayout>
  );
};

export default LoginPage;
