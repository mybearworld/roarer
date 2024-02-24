<script setup lang="ts">
import { ref } from "vue";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import linkifyHtml from "linkify-html";
import "linkify-plugin-mention";
import markdownit from "markdown-it";
import Token from "markdown-it/lib/token";
import { useI18n } from "vue-i18n";
import { hostWhitelist } from "../lib/hostWhitelist";
import { DISCORD_REGEX } from "../lib/discordEmoji";
import { useMarkdownIdsStore } from "../stores/markdownIds";
import { useSettingsStore } from "../stores/settings";
import { effect } from "vue";
// @ts-expect-error
import scratchblocks from "scratchblocks";

const { md, inline, noImages } = defineProps<{
  md: string;
  inline?: boolean;
  noImages?: boolean;
}>();

const settingsStore = useSettingsStore();
const { t } = useI18n();

const ATTACHMENT_REGEX = /\[([^\]]+?): (?! )([^\]]+?)\]/;
const IMAGE_REGEX = new RegExp(
  ATTACHMENT_REGEX.source + "|" + DISCORD_REGEX.source,
  "g",
);

const id = useMarkdownIdsStore().getNewId();

const trimmedMarkdown = md.replace(/(?:\s|\u200c)+$/, "");

const markdown = markdownit({
  breaks: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(str, { language: lang }).value;
    }
    return "";
  },
});
const main = ref<HTMLDivElement | null>(null);

const tokens = inline
  ? markdown.parseInline(trimmedMarkdown, {})
  : markdown.parse(trimmedMarkdown, {});
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
const renderedMarkdown = markdown.renderer.render(tokens, markdown.options, {});
effect(() => {
  if (!main.value) {
    return;
  }
  const element = main.value;
  const domParser = new DOMParser();
  element.innerHTML = renderedMarkdown;
  element.querySelectorAll("img").forEach((img) => {
    if (
      noImages ||
      (!settingsStore.anyImageHost &&
        !hostWhitelist.some((host) => img.src.startsWith(host)))
    ) {
      const span = document.createElement("span");
      span.textContent = img.dataset.original || `![${img.src}](${img.alt})`;
      img.replaceWith(span);
      return;
    }
    if (img.dataset.original && !img.dataset.original.startsWith("<")) {
      const clonedImg = img.cloneNode();
      element.append(clonedImg);
      img.remove();
    } else {
      img.classList.add("inline-block");
    }
  });
  // using the built in linkify feature of markdown-it would not allow the
  // above change for images
  element.innerHTML = linkifyHtml(element.innerHTML, {
    formatHref: {
      mention: (href) => `#/users${href}`,
    },
    ignoreTags: ["code"],
  });
  [...element.querySelectorAll("img")].forEach((element) => {
    if (element.alt.startsWith("(sticker) ")) {
      element.alt = element.alt.replace("(sticker) ", "");
      element.classList.add("rounded-xl");
    }
  });
  [...element.querySelectorAll("img")].forEach(async (element) => {
    let request;
    try {
      request = await fetch(element.src);
    } catch {
      return;
    }
    if (request.status !== 200) {
      return;
    }
    const contentType = request.headers.get("content-type")?.split(";")[0];
    if (!contentType) {
      return;
    }
    const isAudio = contentType.startsWith("audio/");
    const isVideo = contentType.startsWith("video/");
    if (isAudio || isVideo) {
      const newElement = document.createElement(isAudio ? "audio" : "video");
      newElement.src = element.src;
      newElement.controls = true;
      element.replaceWith(newElement);
      return;
    }
    const downloadButton = document.createElement("button");
    downloadButton.className =
      "rounded-xl px-2 py-1 bordered:bg-accent bordered:text-accent-text filled:bg-background filled:text-text";
    const download = document.createElement("a");
    download.className = "no-style";
    download.textContent = t("download", {
      fileName: element.alt,
      contentType,
    });
    download.href = URL.createObjectURL(await request.blob());
    download.download = element.alt;
    downloadButton.append(download);
    element.replaceWith(downloadButton);
  });
  scratchblocks.renderMatching(`#${id} pre code.language-scratch`, {
    style: settingsStore.useScratch2Blocks ? "scratch2" : "scratch3",
    scale: settingsStore.useScratch2Blocks ? 1 : 0.675,
  });
  scratchblocks.renderMatching(`#${id} pre code.language-scratch3`, {
    style: "scratch3",
    scale: 0.675,
  });
  scratchblocks.renderMatching(`#${id} pre code.language-scratch2`);
});
</script>

<template>
  <div
    class="max-h-96 space-y-2 break-words [&>blockquote]:opacity-40 [&_a:not(.no-style)]:text-link [&_a:not(.no-style)]:underline [&_blockquote]:min-h-5 [&_blockquote]:border-l-2 [&_blockquote]:border-text [&_blockquote]:pl-2 [&_blockquote]:italic [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:text-2xl [&_h3]:font-bold [&_h4]:text-xl [&_h4]:font-bold [&_h5]:text-lg [&_h5]:font-bold [&_h6]:text-sm [&_h6]:font-bold [&_hr]:mx-8 [&_hr]:my-2 [&_hr]:border-text [&_hr]:opacity-40 [&_img]:max-h-96 [&_img]:align-top [&_li]:list-inside [&_ol_li]:list-decimal [&_td]:border-[1px] [&_td]:border-text [&_td]:px-2 [&_td]:py-1 [&_th]:border-[1px] [&_th]:border-text [&_th]:px-2 [&_th]:py-1 [&_ul_li]:list-disc [&_video]:max-h-96"
    :id="id"
    ref="main"
  ></div>
</template>
