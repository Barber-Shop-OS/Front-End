import { useEffect } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";

import { logout, bootstrapSessionRequest } from "@/features/auth/slices/authSlice";
import { selectAccessToken, selectAuthStatus } from "@/features/auth/selectors";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import AppRoutes from "@/routes";
import { setUnauthorizedHandler } from "@/services/http";

/**
 * Inicializa a sessão no carregamento do app:
 * - com token salvo → valida via GET /auth/me (bootstrap);
 * - sem token → marca como não autenticado (libera os guards).
 * Também registra o handler global de 401 (sessão expirada → /login).
 */
const SessionBootstrap = (): null => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector(selectAuthStatus);
  const accessToken = useAppSelector(selectAccessToken);

  useEffect(() => {
    if (status !== "idle") return;
    dispatch(accessToken ? bootstrapSessionRequest() : logout());
  }, [status, accessToken, dispatch]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch(logout());
      navigate("/login", { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [dispatch, navigate]);

  return null;
};

const App = (): JSX.Element => (
  <BrowserRouter>
    <SessionBootstrap />
    <AppRoutes />
  </BrowserRouter>
);

export default App;
