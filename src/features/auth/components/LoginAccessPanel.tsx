import LoginForm from "@/features/auth/components/LoginForm";
import {
  loginFailure,
  loginWithGoogleRequest,
} from "@/features/auth/slices/authSlice";
import { startGoogleOAuthCodeFlow } from "@/features/auth/utils/googleAuth";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

const LoginAccessPanel = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const handleGoogleLogin = async (): Promise<void> => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      dispatch(
        loginFailure(
          "Defina VITE_GOOGLE_CLIENT_ID para habilitar o login Google.",
        ),
      );
      return;
    }

    try {
      await startGoogleOAuthCodeFlow({
        clientId,
        redirectUri: `${window.location.origin}/login`,
        onSuccess: (authorizationCode) => {
          dispatch(
            loginWithGoogleRequest({
              provider: "google",
              authorizationCode,
              redirectUri: `${window.location.origin}/login`,
              source: "web",
            }),
          );
        },
        onError: (message) => {
          dispatch(loginFailure(message));
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha no login com Google.";
      dispatch(loginFailure(message));
    }
  };

  return (
    <section className="relative flex items-center justify-center bg-slate-50 px-6 py-12 sm:px-10 lg:min-h-[760px] lg:px-12">
      <div className="pointer-events-none absolute -top-20 right-0 h-80 w-80 rounded-xl bg-indigo-100/60 blur-3xl" />

      <article className="relative z-10 w-full max-w-96 space-y-8">
        <header className="space-y-2">
          <p className="text-3xl leading-9 text-blue-700">BarberOS</p>
          <h2 className="text-4xl leading-10 text-gray-900">
            Bem-vindo de volta
          </h2>
          <p className="text-lg leading-7 text-gray-700">
            Acesse sua conta para continuar.
          </p>
        </header>

        <LoginForm />

        <div className="relative pt-2" aria-hidden="true">
          <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-indigo-100" />
          <div className="relative flex justify-center">
            <span className="bg-slate-50 px-4 text-base font-medium leading-6 text-gray-700">
              Ou
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            void handleGoogleLogin();
          }}
          disabled={authState.status === "loading"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-100 px-4 py-3.5 text-base font-semibold text-gray-900 transition hover:bg-violet-200"
        >
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-500 text-[10px] font-bold text-gray-700"
            aria-hidden="true"
          >
            G
          </span>
          {authState.status === "loading"
            ? "Conectando..."
            : "Entrar com Google"}
        </button>

        <footer className="inline-flex w-full justify-center gap-1 pt-2 text-base leading-6">
          <span className="font-medium text-gray-700">
            Ainda não possui acesso?
          </span>
          <button
            type="button"
            className="font-bold text-blue-700 hover:text-blue-800"
          >
            Criar conta
          </button>
        </footer>
      </article>
    </section>
  );
};

export default LoginAccessPanel;
