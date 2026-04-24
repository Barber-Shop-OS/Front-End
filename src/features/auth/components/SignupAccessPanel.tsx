import SignupForm from "@/features/auth/components/SignupForm";
import {
  signupFailure,
  signupWithGoogleRequest,
} from "@/features/auth/slices/authSlice";
import { startGoogleOAuthCodeFlow } from "@/features/auth/utils/googleAuth";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useNavigate } from "react-router-dom";

const SignupAccessPanel = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleGoogleSignup = async (): Promise<void> => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      dispatch(
        signupFailure(
          "Defina VITE_GOOGLE_CLIENT_ID para habilitar o cadastro com Google.",
        ),
      );
      return;
    }

    try {
      await startGoogleOAuthCodeFlow({
        clientId,
        redirectUri: `${window.location.origin}/signup`,
        onSuccess: (authorizationCode) => {
          dispatch(
            signupWithGoogleRequest({
              provider: "google",
              authorizationCode,
              redirectUri: `${window.location.origin}/signup`,
              source: "web",
            }),
          );
        },
        onError: (message) => {
          dispatch(signupFailure(message));
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Falha no cadastro com Google.";
      dispatch(signupFailure(message));
    }
  };

  const handleNavigateToLogin = (): void => {
    navigate("/login");
  };

  return (
    <section className="relative flex items-center justify-center bg-slate-50 px-6 py-12 sm:px-10 lg:min-h-screen lg:px-12">
      <div className="pointer-events-none absolute -top-20 right-0 h-80 w-80 rounded-xl bg-indigo-100/60 blur-3xl" />

      <article className="relative z-10 w-full max-w-96 space-y-6">
        <header className="space-y-2">
          <p className="text-2xl leading-8 text-blue-700">BarberOS</p>
          <h2 className="text-3xl leading-9 text-gray-900">Criar Conta</h2>
          <p className="text-base leading-6 text-gray-700">
            O primeiro passo para a precisão digital.
          </p>
        </header>

        <SignupForm />

        <div className="relative pt-2" aria-hidden="true">
          <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-indigo-100" />
          <div className="relative flex justify-center">
            <span className="bg-slate-50 px-4 text-xs font-semibold uppercase leading-4 tracking-wide text-gray-700">
              Ou
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            void handleGoogleSignup();
          }}
          disabled={authState.status === "loading"}
          className="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-violet-100 px-4 py-3.5 text-sm font-semibold text-gray-900 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            className="inline-flex h-5 w-5 items-center justify-center gap-1"
            aria-hidden="true"
          >
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="h-2 w-3.5 rounded-full bg-green-600" />
            <span className="h-2 w-1 rounded-full bg-yellow-500" />
            <span className="h-2 w-3.5 rounded-full bg-red-500" />
          </span>
          {authState.status === "loading"
            ? "Cadastrando..."
            : "Cadastro com Google"}
        </button>

        <footer className="inline-flex w-full justify-center gap-1 text-sm leading-5">
          <span className="font-medium text-gray-700">Já tem uma conta?</span>
          <button
            type="button"
            onClick={handleNavigateToLogin}
            className="font-bold text-blue-700 hover:text-blue-800"
          >
            Entrar agora
          </button>
        </footer>
      </article>
    </section>
  );
};

export default SignupAccessPanel;
