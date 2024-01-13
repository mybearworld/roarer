import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), topLevelAwait()],
  base: "/roarer",
  build: {
    rollupOptions: {
      input: {
        index: "./index.html",
        "404": "./404.html",
      },
    },
  },
});
