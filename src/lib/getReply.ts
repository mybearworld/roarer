const REPLY_REGEX =
  /^@[a-z_0-9-]+(?: ".{0,40}…?" (?:\(([a-f0-9\-]+)\))?| \[([a-f0-9\-]+)\])?(?:\n| )(.*)$/is;

export const getReply = (post: string) => {
  const match = post.match(REPLY_REGEX);
  if (!match) {
    return null;
  }
  // const decodedId = match[1] ? match[1] : null
  return {
    id: match[1] || match[2] || null,
    postContent: match[3],
  };
};
