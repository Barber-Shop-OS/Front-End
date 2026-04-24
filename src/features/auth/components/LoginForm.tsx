import { useState, type FormEvent } from "react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginRequest } from "@/features/auth/slices/authSlice";

const LoginForm = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("admin@saas.com");
  const [password, setPassword] = useState("1234");

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    dispatch(loginRequest({ email, password }));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6" noValidate>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-base font-semibold uppercase tracking-wide text-slate-600"
        >
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="seu@email.com.br"
          required
          className="w-full rounded-lg border border-transparent bg-indigo-50 px-4 py-3.5 text-lg text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="password"
            className="text-base font-semibold uppercase tracking-wide text-slate-600"
          >
            Senha
          </label>
          <button
            type="button"
            className="text-base font-semibold text-blue-700 transition hover:text-blue-800"
          >
            Esqueci minha senha
          </button>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
          required
          className="w-full rounded-lg border border-transparent bg-indigo-50 px-4 py-3.5 text-lg text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {authState.error ? (
        <p className="text-sm text-red-600" role="alert" aria-live="polite">
          {authState.error}
        </p>
      ) : null}

      <button
        type="submit"
        className="inline-flex w-full justify-center rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-3.5 text-base font-bold text-white shadow-sm transition hover:from-blue-800 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={authState.status === "loading"}
      >
        {authState.status === "loading"
          ? "Entrando..."
          : "Entrar na Plataforma"}
      </button>
    </form>
  );
};

export default LoginForm;
