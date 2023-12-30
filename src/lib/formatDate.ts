const formatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeStyle: "medium",
});

export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return formatter.format(date);
};
