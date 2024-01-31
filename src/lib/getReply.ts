const REPLY_REGEX =
  /^(@[a-z_0-9-]+(?: ".{0,40}…?" (?:\(([a-f0-9\-]+)\))?| \[([a-f0-9\-]+)\])?(?:\n| ))(.*)$/is;

export const getReply = (post: string): Reply | null => {
  const match = post.match(REPLY_REGEX);
  if (!match) {
    return null;
  }
  // const decodedId = match[1] ? match[1] : null
  return {
    id: match[2] || match[3] || null,
    postContent: match[4],
    replyText: match[1],
  };
};

export type Reply = {
  id: string | null;
  postContent: string;
  replyText: string;
};
