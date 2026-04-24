import { useState, type FormEvent } from "react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { signupRequest } from "@/features/auth/slices/authSlice";

const SignupForm = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    dispatch(signupRequest({ name, email, password }));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5" noValidate>
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-xs font-bold uppercase tracking-wide text-slate-600"
        >
          Nome Completo
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          placeholder="Ex: João da Silva"
          required
          className="w-full rounded-lg border border-transparent bg-indigo-50 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="signup-email"
          className="block text-xs font-bold uppercase tracking-wide text-slate-600"
        >
          E-mail
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="contato@barbearia.com"
          required
          className="w-full rounded-lg border border-transparent bg-indigo-50 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="signup-password"
          className="block text-xs font-bold uppercase tracking-wide text-slate-600"
        >
          Senha
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="••••••••"
          required
          className="w-full rounded-lg border border-transparent bg-indigo-50 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {authState.error ? (
        <p className="text-sm text-red-600" role="alert" aria-live="polite">
          {authState.error}
        </p>
      ) : null}

      <button
        type="submit"
        className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:from-blue-800 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={authState.status === "loading"}
      >
        {authState.status === "loading" ? "Criando Conta..." : "Criar Conta"}
        <span
          className="inline-flex h-3 w-3 bg-white rounded-full"
          aria-hidden="true"
        />
      </button>
    </form>
  );
};

export default SignupForm;
