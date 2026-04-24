import SignupAccessPanel from "@/features/auth/components/SignupAccessPanel";
import SignupHeroPanel from "@/features/auth/components/SignupHeroPanel";
import AuthLayout from "@/layouts/AuthLayout";

const SignupPage = (): JSX.Element => {
  return (
    <AuthLayout>
      <section className="grid min-h-screen w-full overflow-hidden bg-slate-50 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <SignupHeroPanel />
        <SignupAccessPanel />
      </section>
    </AuthLayout>
  );
};

export default SignupPage;
