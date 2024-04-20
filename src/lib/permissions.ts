export const getPermissions = (permissionSet: number) => {
  const allPermissions = new Set(
    permissions.filter((_, index) => permissionSet & (1 << index)),
  );
  return allPermissions;
};

export type Permission = (typeof permissions)[number];
export const permissions = [
  "permSysadmin",
  "permViewReports",
  "permEditReports",
  "permViewNotes",
  "permEditNotes",
  "permViewPosts",
  "permDeletePosts",
  "permViewAlts",
  "permSendAlerts",
  "permKickUsers",
  "permClearUserQuotes",
  "permViewBanStates",
  "permEditBanStates",
  "permDeleteUsers",
  "permViewIPs",
  "permBlockIPs",
  "permViewChats",
  "permEditChats",
  "permSendAnnouncements",
] as const;
