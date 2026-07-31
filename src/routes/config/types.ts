import type { ReactNode } from "react";

/**
 * Configuração base de uma rota do sistema.
 * Os guards definem o nível de acesso de cada grupo de rotas.
 */
export interface RouteConfig {
  /** Caminho da rota (ex: "/dashboard") */
  path: string;
  /** Elemento renderizado pela rota */
  element: ReactNode;
  /** Se a rota é a index de um grupo (ex: index dentro de um layout) */
  index?: boolean;
}

/**
 * Grupo de rotas com um guard específico.
 */
export interface RouteGroup {
  /** Nome do grupo (apenas para organização/debug) */
  name: string;
  /** Configurações das rotas do grupo */
  routes: RouteConfig[];
}

