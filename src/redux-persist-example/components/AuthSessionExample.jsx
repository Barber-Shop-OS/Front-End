import { useDispatch, useSelector } from "react-redux";

import { loginSuccess, logout } from "../store/slices/authSlice";

/**
 * Componente de exemplo — EXEMPLO ISOLADO
 *
 * Demonstra como:
 *  1. Disparar login: useDispatch + loginSuccess({ user, token })
 *  2. Ler dados salvos/persistidos: useSelector
 *  3. Deslogar: useDispatch + logout
 */
const AuthSessionExample = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleLogin = () => {
    dispatch(
      loginSuccess({
        user: {
          id: "1",
          name: "Anderson Reis",
          email: "anderson@barberos.com",
          role: "owner",
        },
        token: "fake-jwt-token-example",
      }),
    );
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div
      style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}
    >
      <h1>Redux Persist — Exemplo Isolado</h1>

      <section>
        <h2>Status</h2>
        <p>
          <strong>Autenticado:</strong> {isAuthenticated ? "✅ Sim" : "❌ Não"}
        </p>
        <p>
          <strong>Usuário:</strong>{" "}
          {user ? `${user.name} (${user.email})` : "Nenhum usuário"}
        </p>
        <p>
          <strong>Token:</strong> {token ? token : "Nenhum token"}
        </p>
      </section>

      <section style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button onClick={handleLogin} type="button">
          Simular Login
        </button>
        <button onClick={handleLogout} type="button">
          Logout
        </button>
      </section>

      <p style={{ fontSize: "0.85rem", color: "#666" }}>
        Recarregue a página (F5): o estado é restaurado do localStorage via
        Redux Persist.
      </p>
    </div>
  );
};

export default AuthSessionExample;
