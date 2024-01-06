import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import linkifyHtml from "linkify-html";
import "linkify-plugin-mention";
import markdownit from "markdown-it";
// @ts-expect-error - the type definitions aren't correct
import { full as emoji } from "markdown-it-emoji";
import Token from "markdown-it/lib/token";
import { hostWhitelist } from "../lib/hostWhitelist";
import { useLocationStore } from "../stores/location";

const IMAGE_REGEX = /\[([^\]]+?): (?! )([^\]]+?)\]/g;

const markdown = markdownit({
  breaks: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(str, { language: lang }).value;
    }
    return "";
  },
}).use(emoji, { shortcuts: {} });

export const parseMarkdown = (
  md: string,
  locationStore: ReturnType<typeof useLocationStore>,
) => {
  const html = toHTML(md);
  const domParser = new DOMParser();
  const postDocument = domParser.parseFromString(html, "text/html");
  postDocument.querySelectorAll("img").forEach((img) => {
    if (!hostWhitelist.some((host) => img.src.startsWith(host))) {
      const span = document.createElement("span");
      span.textContent = img.dataset.original || `![${img.src}](${img.alt})`;
      img.replaceWith(span);
    }
  });
  postDocument.querySelectorAll("a").forEach((element) => {
    const text = element.textContent;
    if (!text || !element.textContent?.startsWith("@")) {
      return;
    }
    const user = text.slice(1);
    element.href = "#";
    element.role = "button";
    element.addEventListener("click", (e) => {
      e.preventDefault();
      locationStore.sublocation = user;
      locationStore.location = "users";
    });
  });
  postDocument.querySelectorAll("img").forEach(async (element) => {
    const request = await fetch(element.src);
    if (request.status !== 200) {
      return;
    }
    const contentType = request.headers.get("content-type");
    const isAudio = contentType?.startsWith("audio/");
    const isVideo = contentType?.startsWith("video/");
    if (!isAudio && !isVideo) {
      return;
    }
    const newElement = document.createElement(isAudio ? "audio" : "video");
    newElement.src = element.src;
    newElement.controls = true;
    element.replaceWith(newElement);
  });
  const sanitizedHTML = postDocument.body.innerHTML;
  // using the built in linkify feature of markdown-it would not allow the
  // above change for images
  const linkifiedHTML = linkifyHtml(sanitizedHTML, {
    formatHref: {
      mention: (href) => `https://app.meower.org/users${href}`,
    },
  });
  return linkifiedHTML;
};

const toHTML = (md: string) => {
  const tokens = markdown.parse(md, {});
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
      images.forEach((image, i) => {
        const index = image.index;
        if (index === undefined) {
          return;
        }
        const beforeText = content.slice(0, index);
        const beforeTextToken = new Token("text", "", 0);
        beforeTextToken.content = beforeText;
        newTextTokens.push(beforeTextToken);
        const [fullMatch, alt, src] = image;
        const imageToken = new Token("image", "", 0);
        imageToken.content = alt;
        imageToken.tag = "img";
        imageToken.attrs = [
          ["alt", ""],
          ["src", src],
          // This is not used (yet?)
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
