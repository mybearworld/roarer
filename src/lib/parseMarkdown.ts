import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import linkifyHtml from "linkify-html";
import "linkify-plugin-mention";
import markdownit from "markdown-it";
import Token from "markdown-it/lib/token";
import { hostWhitelist } from "../lib/hostWhitelist";
import { useSettingsStore } from "../stores/settings";

export const ATTACHMENT_REGEX = /\[([^\]]+?): (?! )([^\]]+?)\]/;
export const DISCORD_REGEX = /<a?:(\w+):(\d+)>/;
export const IMAGE_REGEX = new RegExp(
  ATTACHMENT_REGEX.source + "|" + DISCORD_REGEX.source,
  "g",
);

const markdown = markdownit({
  breaks: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(str, { language: lang }).value;
    }
    return "";
  },
});

// export const parseMarkdown = async (
//   md: string,
//   { inline = false, images = true },
// ) => {
//   const settingsStore = useSettingsStore();

//   const html = toHTML(md, inline);
//   const domParser = new DOMParser();
//   const postDocument = domParser.parseFromString(html, "text/html");

//   return linkifiedDocument.body;
// };

const toHTML = (md: string, inline: boolean) => {
  const tokens = inline ? markdown.parseInline(md, {}) : markdown.parse(md, {});
  const newTokens: Token[] = [];
  tokens.forEach((token) => {
    if (token.type !== "inline" || !token.children) {
      newTokens.push(token);
      return;
    }
    const newChildren: Token[] = [];
    token.children.forEach((child) => {
      if (child.type !== "text") {
        newChildren.push(child);
        return;
      }
      const content = child.content;
      const images = [...content.matchAll(IMAGE_REGEX)];
      if (images.length === 0) {
        newChildren.push(child);
        return;
      }
      const newTextTokens: Token[] = [];
      const matches = images.map(
        (image) =>
          ({
            originalMatch: image,
            specificMatch:
              image[0].match(ATTACHMENT_REGEX) ??
              image[0].match(DISCORD_REGEX) ??
              (() => {
                throw new Error("this can't happen");
              })(),
          }) as const,
      );
      let previousIndex: number | null = null;
      matches.forEach(({ originalMatch, specificMatch }, i) => {
        const index = originalMatch.index;
        if (index === undefined) {
          return;
        }
        const beforeText = content
          .slice(previousIndex ?? 0, index)
          .replace(IMAGE_REGEX, "");
        previousIndex = index;
        const beforeTextToken = new Token("text", "", 0);
        beforeTextToken.content = beforeText;
        newTextTokens.push(beforeTextToken);
        const [fullMatch, alt, src] = specificMatch;
        const imageToken = new Token("image", "", 0);
        imageToken.content = alt;
        imageToken.tag = "img";
        imageToken.attrs = [
          ["alt", ""],
          [
            "src",
            fullMatch.startsWith("<")
              ? `https://cdn.discordapp.com/emojis/${src}.${
                  fullMatch.startsWith("<a") ? "gif" : "webp"
                }?size=24&quality=lossless`
              : src,
          ],
          ["data-original", fullMatch],
        ];
        const altTextToken = new Token("text", "", 0);
        altTextToken.content = alt;
        imageToken.children = [altTextToken];
        newTextTokens.push(imageToken);
        if (i === images.length - 1) {
          const afterText = content.slice(index + fullMatch.length);
          const afterTextToken = new Token("text", "", 0);
          afterTextToken.content = afterText;
          newTextTokens.push(afterTextToken);
        }
      });
      newChildren.push(...newTextTokens);
    });
    token.children = newChildren;
    newTokens.push(token);
  });
  return markdown.renderer.render(tokens, markdown.options, {});
};
