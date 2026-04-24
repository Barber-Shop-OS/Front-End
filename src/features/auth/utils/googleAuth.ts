interface GoogleOAuthCodeResponse {
  code?: string;
  error?: string;
  error_description?: string;
  scope?: string;
}

interface GoogleOAuthCodeClient {
  requestCode: () => void;
}

interface GoogleOAuth2 {
  initCodeClient: (config: {
    client_id: string;
    scope: string;
    ux_mode: 'popup';
    redirect_uri: string;
    callback: (response: GoogleOAuthCodeResponse) => void;
  }) => GoogleOAuthCodeClient;
}

interface GoogleAccounts {
  oauth2: GoogleOAuth2;
}

interface GoogleGlobal {
  accounts: GoogleAccounts;
}

interface WindowWithGoogle extends Window {
  google?: GoogleGlobal;
}

const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';

const loadGoogleIdentityScript = async (): Promise<void> => {
  const windowWithGoogle = window as WindowWithGoogle;

  if (windowWithGoogle.google?.accounts?.oauth2) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_IDENTITY_SCRIPT}"]`
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), {
        once: true
      });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Nao foi possivel carregar o script do Google.')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Nao foi possivel carregar o script do Google.'));
    document.head.appendChild(script);
  });

  if (!windowWithGoogle.google?.accounts?.oauth2) {
    throw new Error('SDK do Google indisponivel no navegador.');
  }
};

interface StartGoogleOAuthCodeFlowParams {
  clientId: string;
  redirectUri: string;
  scope?: string;
  onSuccess: (code: string, scope?: string) => void;
  onError: (message: string) => void;
}

export const startGoogleOAuthCodeFlow = async ({
  clientId,
  redirectUri,
  scope = 'openid email profile',
  onSuccess,
  onError
}: StartGoogleOAuthCodeFlowParams): Promise<void> => {
  await loadGoogleIdentityScript();

  const windowWithGoogle = window as WindowWithGoogle;
  const codeClient = windowWithGoogle.google?.accounts?.oauth2.initCodeClient({
    client_id: clientId,
    scope,
    ux_mode: 'popup',
    redirect_uri: redirectUri,
    callback: (response) => {
      if (response.code) {
        onSuccess(response.code, response.scope);
        return;
      }

      onError(
        response.error_description ?? response.error ?? 'Falha no login com Google.'
      );
    }
  });

  if (!codeClient) {
    onError('Nao foi possivel inicializar o login do Google.');
    return;
  }

  codeClient.requestCode();
};
