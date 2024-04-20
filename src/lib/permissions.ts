export const getPermissions = (permissionSet: number) => {
  let counter = 0;
  const allPermissions: Permission[] = [];
  permissions.forEach((permission) => {
    if (permissionSet & (1 << counter)) {
      allPermissions.push(permission);
    }
    counter++;
  });
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
