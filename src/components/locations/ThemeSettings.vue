<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { themes } from "../../lib/themes";
import { useSettingsStore, themeSchema } from "../../stores/settings";
import { effect } from "vue";

const settingsStore = useSettingsStore();
const { t } = useI18n();

const stringifyTheme = () => {
  return JSON.stringify({
    ...settingsStore.theme,
    orangeLight: settingsStore.theme.orange,
    orangeDark: settingsStore.theme.orange,
    tinting: settingsStore.theme.orange,
  });
};

const themeInputRef = ref<HTMLInputElement | null>(null);
effect(() => {
  if (!themeInputRef.value) {
    return;
  }
  themeInputRef.value.value = stringifyTheme();
});
const updateTheme = () => {
  if (!themeInputRef.value) {
    return;
  }
  let objectTheme: unknown;
  try {
    objectTheme = JSON.parse(themeInputRef.value.value);
  } catch {
    alert(t("themeInvalidJSON"));
    themeInputRef.value.value = stringifyTheme();
    return;
  }
  const safeTheme = themeSchema.safeParse(objectTheme);
  if (!safeTheme.success) {
    alert(safeTheme.error.errors[0].message);
    themeInputRef.value.value = stringifyTheme();
    return;
  }
  settingsStore.theme = {
    ...safeTheme.data,
    roarer_link: safeTheme.data.roarer_link ?? safeTheme.data.orange,
    roarer_postStyle: safeTheme.data.roarer_postStyle ?? "bordered",
  };
};

const colorSettings = [
  {
    msg: t("themeAccent"),
    value: "orange",
    update: (color: string) => (settingsStore.theme.orange = color),
  },
  {
    msg: t("themeBackground"),
    value: "background",
    update: (color: string) => (settingsStore.theme.background = color),
  },
  {
    msg: t("themeForeground"),
    value: "foreground",
    update: (color: string) => (settingsStore.theme.foreground = color),
  },
  {
    msg: t("themeAccentForeground"),
    value: "foregroundOrange",
    update: (color: string) => (settingsStore.theme.foregroundOrange = color),
  },
  {
    msg: t("themeLink"),
    value: "roarer_link",
    update: (color: string) => (settingsStore.theme.roarer_link = color),
  },
] as const;
</script>

<template>
  <div class="flex flex-col gap-2">
    <label class="flex items-center gap-2" v-for="setting in colorSettings">
      <span class="font-bold">{{ setting.msg }}</span>
      <input
        type="color"
        class="rounded-lg bg-transparent"
        v-model="settingsStore.theme[setting.value]"
        @input="(e) => setting.update((e.target as HTMLInputElement).value)"
      />
    </label>
    <div class="flex items-center gap-2">
      <span class="font-bold">{{ t("themePostStyle") }}</span>
      <label>
        <input
          type="radio"
          :checked="settingsStore.theme.roarer_postStyle === 'bordered'"
          @input="settingsStore.theme.roarer_postStyle = 'bordered'"
          name="postStyleRadio"
        />
        {{ t("themePostStyleBordered") }}
      </label>
      <label>
        <input
          type="radio"
          :checked="settingsStore.theme.roarer_postStyle === 'filled'"
          @input="settingsStore.theme.roarer_postStyle = 'filled'"
          name="postStyleRadio"
        />
        {{ t("themePostStyleFilled") }}
      </label>
    </div>
    <div>
      <strong>{{ t("themeCurrent") }}</strong>
      <input
        type="text"
        class="block w-full rounded-lg border-2 border-accent bg-transparent px-2 py-1 font-mono"
        ref="themeInputRef"
        @change="updateTheme"
      />
    </div>
    <div class="flex gap-2">
      <button
        class="rounded-xl bg-accent px-2 py-1 text-accent-text"
        type="button"
        @click="
          () => {
            settingsStore.theme = { ...theme };
          }
        "
        v-for="(theme, name) in themes"
      >
        {{ t(`theme_${name}`) }}
      </button>
    </div>
  </div>
</template>
