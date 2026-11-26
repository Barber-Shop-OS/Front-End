import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import App from '@/App';
import { persistor, store } from '@/store';
import '@/index.css';

// SEC-15: remove a sessão antiga que ficava em localStorage (chave do redux-persist anterior).
try {
  window.localStorage.removeItem('persist:root');
} catch {
  /* storage indisponível: nada a limpar */
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
