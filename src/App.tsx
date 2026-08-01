import { useEffect } from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";

import {
  bootstrapSessionRequest,
  logout,
} from "@/features/auth/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import AppRoutes from "@/routes";
import { setUnauthorizedHandler } from "@/services/http";

const LOGIN_PATH = "/login";

/**
 * Componente interno (dentro do Router) responsável por:
 * - Disparar o bootstrap de sessão no primeiro carregamento.
 * - Registrar o handler global de 401: limpa a sessão e redireciona para
 *   /login sem criar loop quando a rota atual já é a de login.
 */
const AuthBootstrap = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAppSelector((state) => state.auth.status);

  // Bootstrap de sessão (valida token persistido via GET /auth/me).
  useEffect(() => {
    if (status === "idle") {
      dispatch(bootstrapSessionRequest());
    }
  }, [dispatch, status]);

  // Handler global de 401 (requisições autenticadas com token inválido/expirado).
  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch(logout());
      if (location.pathname !== LOGIN_PATH) {
        navigate(LOGIN_PATH, { replace: true });
      }
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [dispatch, navigate, location.pathname]);

  return <AppRoutes />;
};

/**
 * Componente principal do aplicativo.
 * Toda a árvore de rotas (públicas, autenticação, cliente, barbeiro e dono)
 * está organizada em src/routes.
 */
const App = (): JSX.Element => {
  return (
    <BrowserRouter>
      <AuthBootstrap />
    </BrowserRouter>
  );
};

export default App;
