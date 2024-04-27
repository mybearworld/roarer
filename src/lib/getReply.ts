const REPLY_REGEX =
  /^(@[a-z_0-9-]+(?: "[^\n]*(?:…|\.\.\.)?" (?:\(([a-f0-9\-]+)\))?| \[([a-f0-9\-]+)\])?(?:\n| )?)(.*)$/is;

export const getReply = (post: string): Reply | null => {
  const match = post.match(REPLY_REGEX);
  if (!match) {
    return null;
  }
  const postContent = match[4];
  if (postContent === undefined) {
    throw new Error("Post content is not defined");
  }
  const replyText = match[1];
  if (replyText === undefined) {
    throw new Error("Reply text is not defined");
  }
  return {
    id: match[2] || match[3] || null,
    postContent,
    replyText,
  };
};

export type Reply = {
  id: string | null;
  postContent: string;
  replyText: string;
};
