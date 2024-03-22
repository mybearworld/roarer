export const tabs = [
  { name: "routeHome", to: "/" },
  { name: "routeInbox", to: "/inbox" },
  { name: "routeGroups", to: "/chats" },
  { name: "routeUsers", to: "/users" },
  { name: "routeSettings", to: "/settings" },
] as const satisfies Tab[];

export type Tab = {
  name: string;
  to: string;
};
