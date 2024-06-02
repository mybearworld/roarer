import { useI18n } from "vue-i18n";
import { useSettingsStore } from "../stores/settings";

export const formatDate = (timestamp: number) => {
  const { locale } = useI18n();
  const settingsStore = useSettingsStore();

  const formatter = new Intl.DateTimeFormat(locale.value, {
    dateStyle: "long",
    timeStyle: "medium",
    hour12: settingsStore.useTwelveHourTime,
  });
  const date = new Date(timestamp * 1000);
  return formatter.format(date);
};
