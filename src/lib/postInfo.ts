import { createPinia } from "pinia";
import { bridgeBots } from "./bridgeBots";
import { getReply, Reply } from "./getReply";
import { APIPost } from "./schemas/post";
import { useAuthStore } from "../stores/auth";
import { useSettingsStore } from "../stores/settings";

createPinia();

export const getPostInfo = (
  post: APIPost,
  { inbox = false } = {},
): PostInfo => {
  const settingsStore = useSettingsStore();

  const rawContent =
    !settingsStore.filterSwears && post.unfiltered_p
      ? post.unfiltered_p
      : post.p;
  const bridgeMatch = bridgeBots.includes(post.u)
    ? rawContent.match(/^([a-zA-Z0-9_\-]+): (.*)$/s)
    : null;
  const content = bridgeMatch?.[2] ?? rawContent;
  const reply = getReply(content);

  return {
    username: bridgeMatch?.[1] ?? post.u,
    id: post.post_id,
    italic: post.u === "Server" || inbox,
    content: reply?.postContent ?? content,
    bridged: !!bridgeMatch,
    reply,
    isMeowerUser: !bridgeMatch || post.u === "Discord",
  };
};

export type PostInfo = {
  username: string;
  id: string;
  italic: boolean;
  content: string;
  bridged: boolean;
  reply: Reply | null;
  isMeowerUser: boolean;
};
