import { Fragment } from "react";
import { Route, Routes } from "react-router-dom";

import { PublicOnlyRoute, RoleRoute } from "./guards";
import {
  authRoutes,
  barberRoutes,
  customerRoutes,
  ownerRoutes,
  publicRoutes,
  type RouteConfig,
  type RouteGroup,
} from "./config";
import type { UserRole } from "@/types";

/**
 * Renderiza um grupo de rotas envolvidas por um guard.
 */
const renderGroup = (group: RouteGroup, guard?: JSX.Element): JSX.Element => {
  const content = (
    <>
      {group.routes.map((route: RouteConfig) =>
        route.index ? (
          <Route key={route.path} index element={route.element} />
        ) : (
          <Route key={route.path} path={route.path} element={route.element} />
        ),
      )}
    </>
  );

  return guard ? (
    <Route key={group.name} element={guard}>
      {content}
    </Route>
  ) : (
    <Fragment key={group.name}>{content}</Fragment>
  );
};

/**
 * Monta a árvore de rotas do BarberOS separando por perfil:
 * - Públicas: sem guard
 * - Auth: só para não autenticados (PublicOnlyRoute)
 * - Cliente: autenticado + role "customer"
 * - Barbeiro: autenticado + role "barber"
 * - Dono/Gestor: autenticado + role "owner"
 */
const AppRoutes = (): JSX.Element => {
  return (
    <Routes>
      {renderGroup(publicRoutes)}

      {renderGroup(authRoutes, <PublicOnlyRoute />)}

      {renderGroup(
        customerRoutes,
        <RoleRoute allowedRoles={["customer"] as UserRole[]} />,
      )}

      {renderGroup(
        barberRoutes,
        <RoleRoute allowedRoles={["barber"] as UserRole[]} />,
      )}

      {renderGroup(
        ownerRoutes,
        <RoleRoute allowedRoles={["owner"] as UserRole[]} />,
      )}
    </Routes>
  );
};

export default AppRoutes;
