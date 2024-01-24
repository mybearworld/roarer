import { effect, reactive, ref } from "vue";
import { defineStore } from "pinia";
import { z } from "zod";
import { themes } from "../lib/themes";

const ANY_IMG_HOST_STORAGE = "roarer:anyImageHost";
const FILTER_SWEARS_STORAGE = "roarer:filterSwears";
const ENTER_SENDS_STORAGE = "roarer:enterSends";
const THEME_STORAGE = "roarer:theme";

const COLOR_REGEX = /^#[0-9a-f]{6}$/i;

export const useSettingsStore = defineStore("settings", () => {
  const anyImageHost = ref(
    localStorage.getItem(ANY_IMG_HOST_STORAGE) === "true",
  );
  const filterSwears = ref(
    ["true", null].includes(localStorage.getItem(FILTER_SWEARS_STORAGE)),
  );
  const enterSends = ref(
    ["true", null].includes(localStorage.getItem(ENTER_SENDS_STORAGE)),
  );
  const theme = ref<RoarerTheme>(themes.dark);
  const themeStorage = localStorage.getItem(THEME_STORAGE);
  if (themeStorage !== null) {
    try {
      theme.value = roarerThemeSchema.parse(JSON.parse(themeStorage));
    } catch {}
  }

  effect(() => {
    localStorage.setItem(
      ANY_IMG_HOST_STORAGE,
      anyImageHost.value ? "true" : "false",
    );
  });
  effect(() => {
    localStorage.setItem(
      FILTER_SWEARS_STORAGE,
      filterSwears.value ? "true" : "false",
    );
  });
  effect(() => {
    localStorage.setItem(
      ENTER_SENDS_STORAGE,
      enterSends.value ? "true" : "false",
    );
  });
  effect(() => {
    localStorage.setItem(THEME_STORAGE, JSON.stringify(theme.value));
  });

  return {
    anyImageHost,
    filterSwears,
    enterSends,
    theme,
    setTheme(newTheme: RoarerTheme) {
      theme.value = newTheme;
    },
  };
});

const roarerSpecificSettingsSchema = z.object(
  {
    roarer_link: z
      .string({
        required_error: "invalidThemeLinkRequired",
        invalid_type_error: "invalidThemeLinkType",
      })
      .regex(COLOR_REGEX),
    roarer_postStyle: z
      .literal("bordered", {
        required_error: "invalidThemePostStyleRequired",
        invalid_type_error: "invalidThemePostStyleType",
      })
      .or(z.literal("filled")),
  },
  {
    invalid_type_error: "invalidThemeRoarerType",
  },
);
const baseThemeSchema = z.object({
  v: z.literal(1),
  orange: z.string().regex(COLOR_REGEX),
  background: z.string().regex(COLOR_REGEX),
  foreground: z.string().regex(COLOR_REGEX),
  foregroundOrange: z.string().regex(COLOR_REGEX),
});
export const themeSchema = baseThemeSchema.and(
  roarerSpecificSettingsSchema.partial(),
);
export const roarerThemeSchema = baseThemeSchema.and(
  roarerSpecificSettingsSchema,
);
export type Theme = z.infer<typeof themeSchema>;
export type RoarerTheme = z.infer<typeof roarerThemeSchema>;
export const themeVariables = [
  ["orange", "--accent"],
  ["background", "--background"],
  ["foreground", "--text"],
  ["foregroundOrange", "--button-text"],
  ["roarer_link", "--link"],
] as const;
