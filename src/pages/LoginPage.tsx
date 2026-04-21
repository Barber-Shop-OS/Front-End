import LoginForm from "@/features/auth/components/LoginForm";
import AuthLayout from "@/layouts/AuthLayout";

const LoginPage = (): JSX.Element => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
