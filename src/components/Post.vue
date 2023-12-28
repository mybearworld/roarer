<script setup lang="ts">
import { computed, ref } from "vue";
import linkifyHtml from "linkify-html";
import "linkify-plugin-mention";
import markdownit from "markdown-it";
import Token from "markdown-it/lib/token";
import {
  IconArrowForward,
  IconBrandDiscord,
  IconTrash,
  IconWebhook,
} from "@tabler/icons-vue";
import { z } from "zod";
import { hostWhitelist } from "../lib/hostWhitelist";
import { postSchema } from "../lib/postSchema";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();

const { post, dontUpdate } = defineProps<{
  post: z.infer<typeof postSchema>;
  dontUpdate?: boolean;
}>();
const emit = defineEmits<{
  reply: [post: z.infer<typeof postSchema>];
}>();

const username = ref(post.u);
const postContent = ref(post.p);

const isBridged = username.value === "Discord" || username.value === "Webhooks";
if (isBridged) {
  const match = postContent.value.match(/^(.*?): (.*)$/s);
  if (match) {
    username.value = match[1];
    postContent.value = match[2];
  }
}

const isDeleted = ref(false);
const edited = ref<null | z.infer<typeof postSchema>>(null);
const deleteSchema = z.object({
  cmd: z.literal("direct"),
  val: z.object({
    mode: z.literal("delete"),
    id: z.literal(post.post_id),
  }),
});
const editSchema = z.object({
  cmd: z.literal("direct"),
  val: z.object({
    mode: z.literal("update_post"),
    payload: postSchema.and(
      z.object({
        post_id: z.literal(post.post_id),
      }),
    ),
  }),
});
if (!dontUpdate) {
  cloudlinkStore.lookFor(deleteSchema, () => {
    isDeleted.value = true;
  });
  cloudlinkStore.lookFor(editSchema, (packet) => {
    edited.value = packet.val.payload;
  });
}

const remove = async () => {
  try {
    await cloudlinkStore.send(
      {
        cmd: "delete_post",
        val: post.post_id,
      },
      z.object({
        mode: z.literal("delete"),
        id: z.literal(post.post_id),
      }),
    );
  } catch (e) {
    alert(e); // i can do error handling!
  }
};

const md = markdownit({
  breaks: true,
});

const IMAGE_REGEX = /\[([^\]]+?): ([^\]]+?)\]/g;
const markdownPostContent = computed(() => {
  const tokens = md.parse(postContent.value, {});
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
  const parsed = md.renderer.render(tokens, md.options, {});
  const domParser = new DOMParser();
  const postDocument = domParser.parseFromString(parsed, "text/html");
  postDocument.querySelectorAll("img").forEach((img) => {
    if (!hostWhitelist.some((host) => img.src.startsWith(host))) {
      const span = document.createElement("span");
      span.textContent = img.dataset.original || `![${img.src}](${img.alt})`;
      img.replaceWith(span);
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
  return linkifiedHTML;
});
</script>

<template>
  <Post :post="edited" v-if="edited" />
  <div
    class="flex flex-col rounded-xl bg-slate-800 px-2 py-1"
    v-else
    v-if="!isDeleted"
  >
    <div class="space-x-2">
      <span class="font-bold">{{ username }}</span>
      <span
        title="This post was created on the Discord server."
        v-if="post.u === 'Discord'"
      >
        <IconBrandDiscord class="inline-block w-5" />
      </span>
      <span
        title="This post was created via a Webhook. These do not go through Meowers account system, anyone can create a message under any name."
        v-if="post.u === 'Webhooks'"
      >
        <IconWebhook class="inline-block w-5" />
      </span>
      <div class="float-right space-x-3">
        <button
          class="h-4 w-4"
          v-if="post.u === loginStatusStore.username"
          @click="remove"
        >
          <IconTrash />
        </button>
        <button class="h-4 w-4" @click="emit('reply', post)">
          <IconArrowForward />
        </button>
      </div>
    </div>
    <div
      class="space-y-2 [&_a]:text-sky-400 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-slate-500 [&_blockquote]:pl-2 [&_td]:border-[1px] [&_td]:border-slate-500 [&_td]:px-2 [&_td]:py-1 [&_th]:border-[1px] [&_th]:border-slate-500 [&_th]:px-2 [&_th]:py-1"
      v-html="markdownPostContent"
      v-if="markdownPostContent"
    ></div>
    <p v-else>
      {{ postContent }}
    </p>
  </div>
</template>
