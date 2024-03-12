/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API: string;
  readonly VITE_CLOUDLINK: string;
  readonly VITE_ADMIN: string;
  readonly VITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
