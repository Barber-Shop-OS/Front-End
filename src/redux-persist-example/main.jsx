import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import App from "./App";
import { persistor, store } from "./store";

/**
 * Ponto de entrada — EXEMPLO ISOLADO
 *
 * - <Provider store={store}>: disponibiliza a store do Redux para toda a árvore.
 * - <PersistGate persistor={persistor}>: impede a renderização até o estado
 *   persistido ser reidratado do localStorage.
 *
 * Para usar esta versão, aponte o Vite para este arquivo, por exemplo:
 *   vite --config ...  ou  troque o entry em index.html para este módulo.
 */
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<p>Carregando sessão...</p>} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);
