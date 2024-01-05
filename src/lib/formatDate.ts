export const formatDate = (timestamp: number, language: string) => {
  const formatter = new Intl.DateTimeFormat(language, {
    dateStyle: "long",
    timeStyle: "medium",
  });
  const date = new Date(timestamp * 1000);
  return formatter.format(date);
};
