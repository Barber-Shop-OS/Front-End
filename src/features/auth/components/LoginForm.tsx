import { useState, type FormEvent } from "react";

import Button from "@/components/Button";
import Input from "@/components/Input";
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
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Entrar na plataforma
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Use suas credenciais para acessar o dashboard.
        </p>
      </div>

      <Input
        label="E-mail"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
      />

      <Input
        label="Senha"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
      />

      {authState.error ? (
        <p className="text-sm text-red-600">{authState.error}</p>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={authState.status === "loading"}
      >
        {authState.status === "loading" ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};

export default LoginForm;
