import { effect, ref } from "vue";
import { defineStore } from "pinia";
import { z } from "zod";
import { themes } from "../lib/themes";

const THEME_STORAGE = "roarer:theme";

const COLOR_REGEX = /^#[0-9a-f]{6}$/i;

const useTogglable = (name: string, enabledByDefault: boolean) => {
  const taggedName = "roarer:" + name;
  const storageItem = localStorage.getItem(taggedName);
  const setting = ref(
    storageItem === "true" || (enabledByDefault && storageItem === null),
  );
  effect(() => {
    localStorage.setItem(taggedName, setting.value.toString());
  });
  return setting;
};

export const useSettingsStore = defineStore("settings", () => {
  const theme = ref<RoarerTheme>(themes.dark.theme);
  const themeStorage = localStorage.getItem(THEME_STORAGE);
  if (themeStorage !== null) {
    try {
      theme.value = roarerThemeSchema.parse(JSON.parse(themeStorage));
    } catch {}
  }

  effect(() => {
    localStorage.setItem(THEME_STORAGE, JSON.stringify(theme.value));
  });

  return {
    anyImageHost: useTogglable("anyImageHost", false),
    confirmExternalLinks: useTogglable("confirmExternalLinks", true),
    enterSends: useTogglable("enterSends", true),
    filterSwears: useTogglable("filterSwears", true),
    hideBlockedMentions: useTogglable("hideBlockedMentions", false),
    isJoker: useTogglable("isJoker", false),
    showPfps: useTogglable("showPfps", true),
    useScratch2Blocks: useTogglable("useScratch2Blocks", false),
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
    roarer_colorScheme: z
      .literal("dark", {
        invalid_type_error: "invalidThemeIsDark",
      })
      .or(z.literal("light"))
      .default("dark"),
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
  ["orange", "---accent"],
  ["background", "---background"],
  ["foreground", "---text"],
  ["foregroundOrange", "---button-text"],
  ["roarer_link", "---link"],
  ["roarer_colorScheme", "---color-scheme"],
] as const;
