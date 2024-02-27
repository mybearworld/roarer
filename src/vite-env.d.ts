/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API: string;
  readonly VITE_CLOUDLINK: string;
  readonly VITE_ADMIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
