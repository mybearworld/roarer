import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import linkifyHtml from "linkify-html";
import "linkify-plugin-mention";
import markdownit from "markdown-it";
import Token from "markdown-it/lib/token";
import { hostWhitelist } from "../lib/hostWhitelist";

const ATTACHMENT_REGEX = /\[([^\]]+?): (?! )([^\]]+?)\]/;
const DISCORD_REGEX = /<a?:(\w+):(\d+)>/;
const IMAGE_REGEX = new RegExp(
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

export const parseMarkdown = async (
  md: string,
  {
    inline = false,
    images = true,
    anyImageHost = false,
    loadProjectText = "Load project",
  },
) => {
  const html = toHTML(md, inline);
  const domParser = new DOMParser();
  const postDocument = domParser.parseFromString(html, "text/html");
  postDocument.querySelectorAll("img").forEach((img) => {
    if (
      !images ||
      (!anyImageHost && !hostWhitelist.some((host) => img.src.startsWith(host)))
    ) {
      const span = document.createElement("span");
      span.textContent = img.dataset.original || `![${img.src}](${img.alt})`;
      img.replaceWith(span);
      return;
    }
    if (img.dataset.original && !img.dataset.original.startsWith("<")) {
      const clonedImg = img.cloneNode();
      postDocument.body.append(clonedImg);
      img.remove();
    } else {
      img.classList.add("inline-block");
    }
  });
  const sanitizedHTML = postDocument.body.innerHTML;
  // using the built in linkify feature of markdown-it would not allow the
  // above change for images
  const linkifiedHTML = linkifyHtml(sanitizedHTML, {
    formatHref: {
      mention: (href) => `https://app.meower.org/users${href}`,
    },
  });
  const linkifiedDocument = domParser.parseFromString(
    linkifiedHTML,
    "text/html",
  );
  linkifiedDocument.querySelectorAll("a").forEach((element) => {
    const text = element.textContent;
    if (!text || !element.textContent?.startsWith("@")) {
      return;
    }
    const user = text.slice(1);
    element.href = `#/users/${user}`;
  });
  const doneProjectEmbeds = new Set<string>();
  const buttons = document.createElement("div");
  buttons.className = "flex gap-2 flex-wrap";
  linkifiedDocument.querySelectorAll("a").forEach((element) => {
    if (inline) {
      return;
    }
    const link = element.href;
    if (link !== element.textContent) {
      return;
    }
    const match = link.match(
      /(?:https?:\/\/)?(scratch.mit.edu\/projects|turbowarp.org)\/(\d+)\/?/,
    );
    if (!match) {
      return;
    }
    const url = match[1];
    const projectId = match[2];
    if (doneProjectEmbeds.has(projectId)) {
      return;
    }
    doneProjectEmbeds.add(projectId);
    const button = document.createElement("button");
    button.textContent = loadProjectText + ` (${projectId})`;
    button.className = "bg-slate-700 px-2 py-1 rounded-xl";
    const iframe = document.createElement("iframe");
    iframe.src = `https://${url}/${projectId}/embed`;
    iframe.width = "485";
    iframe.height = "402";
    button.addEventListener("click", () => {
      button.replaceWith(iframe);
    });
    buttons.append(button);
  });
  if (buttons.childElementCount) {
    linkifiedDocument.body.append(buttons);
  }
  [...linkifiedDocument.querySelectorAll("img")].forEach(async (element) => {
    let request;
    try {
      request = await fetch(element.src);
    } catch {
      return;
    }
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

  return linkifiedDocument.body;
};

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
      matches.forEach(({ originalMatch, specificMatch }, i) => {
        const index = originalMatch.index;
        if (index === undefined) {
          return;
        }
        const beforeText = content.slice(0, index).replace(IMAGE_REGEX, "");
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
                  fullMatch.startsWith("a") ? "gif" : "webp"
                }?size=32&quality=lossless`
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
