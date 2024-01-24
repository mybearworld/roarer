import { RoarerTheme } from "../stores/settings";

export const themes = {
  light: {
    v: 1,
    orange: "#cbd5e1",
    background: "#f1f5f9",
    foreground: "#0f172a",
    foregroundOrange: "#0f172a",
    roarer_link: "#0369a1",
    roarer_postStyle: "filled",
  },
  dark: {
    v: 1,
    orange: "#1e293b",
    background: "#020617",
    foreground: "#cbd5e1",
    foregroundOrange: "#e2e8f0",
    roarer_link: "#38bdf8",
    roarer_postStyle: "filled",
  },
  stone: {
    v: 1,
    orange: "#292524",
    background: "#0c0a09",
    foreground: "#d6d3d1",
    foregroundOrange: "#e7e5e4",
    roarer_link: "#38bdf8",
    roarer_postStyle: "filled",
  },
  meower: {
    v: 1,
    orange: "#e48b26",
    background: "#181818",
    foreground: "#eeeeff",
    foregroundOrange: "#181818",
    roarer_link: "#e48b26",
    roarer_postStyle: "bordered",
  },
} satisfies { [k in string]: RoarerTheme };
