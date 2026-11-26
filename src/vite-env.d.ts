/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL?: string;
	readonly VITE_GOOGLE_CLIENT_ID?: string;
	readonly VITE_USE_MOCK_AUTH?: 'true' | 'false';
	readonly VITE_GOOGLE_AUTH_ENABLED?: 'true' | 'false';
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

