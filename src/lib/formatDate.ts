import { useI18n } from "vue-i18n";

export const formatDate = (timestamp: number) => {
  const { locale } = useI18n();

  const formatter = new Intl.DateTimeFormat(locale.value, {
    dateStyle: "long",
    timeStyle: "medium",
  });
  const date = new Date(timestamp * 1000);
  return formatter.format(date);
};
