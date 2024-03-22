/// <reference types="vite/client" />

import "vue-router";

interface ImportMetaEnv {
  readonly VITE_API: string;
  readonly VITE_CLOUDLINK: string;
  readonly VITE_ADMIN: string;
  readonly VITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "vue-router" {
  interface RouteMeta {
    requiresLogin?: true;
  }
}
