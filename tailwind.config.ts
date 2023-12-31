import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{vue,ts}"],
  theme: {
    extend: {
      fontFamily: {
        mono: "monospace",
      },
    },
  },
  plugins: [],
} satisfies Config;
