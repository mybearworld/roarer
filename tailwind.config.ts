import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{vue,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "Noto Color Emoji"],
        mono: "monospace",
      },
    },
  },
  plugins: [],
} satisfies Config;
