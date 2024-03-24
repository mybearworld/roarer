import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: ["./index.html", "./src/**/*.{vue,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Plex",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Noto Color Emoji",
        ],
        mono: "monospace",
      },
      colors: {
        accent: "var(---accent, theme(colors.slate.800))",
        link: "var(---link, theme(colors.sky.400))",
        background: "var(---background, theme(colors.slate.950))",
        text: "var(---text, theme(colors.slate.300))",
        "accent-text": "var(---button-text, theme(colors.slate.200))",
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("filled", ".post-style-filled &");
      addVariant("bordered", ".post-style-bordered &");
    }),
  ],
} satisfies Config;
