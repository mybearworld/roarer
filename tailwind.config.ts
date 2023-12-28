import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.vue"],
  theme: {
    extend: {
      fontFamily: {
        mono: "monospace",
      },
    },
  },
  plugins: [],
} satisfies Config;
