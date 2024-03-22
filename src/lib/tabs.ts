export const tabs = [
  { message: "routeHome", to: "/" },
  { message: "routeInbox", to: "/inbox" },
  { message: "routeGroups", to: "/chats" },
  { message: "routeUsers", to: "/users" },
  { message: "routeSettings", to: "/settings" },
] satisfies Tab[];

export type Tab = {
  message: string;
  to: string;
};
