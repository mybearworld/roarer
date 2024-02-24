import { useI18n } from "vue-i18n";
import { APIPost } from "./schemas/post";

export const addOntoPost = (post: APIPost): APIPost => {
  const { t } = useI18n();

  if (post.post_id === "7fffbd66-385b-4f30-a5a5-87036bcbcc9f") {
    // Endpoint removal from Cloudlink 3 on April 1st, 2024
    return {
      ...post,
      p: t("april1st2024Cl3Message") + post.p,
    };
  }
  return { ...post, p: post.p };
};
