<script setup lang="ts">
import { computed, effect, ref } from "vue";
import linkifyHtml from "linkify-html";
import "linkify-plugin-mention";
import markdownit from "markdown-it";
import Token from "markdown-it/lib/token";
import {
  IconArrowForward,
  IconBrandDiscord,
  IconBuildingBridge,
  IconCircleFilled,
  IconEdit,
  IconReload,
  IconTrash,
  IconWebhook,
} from "@tabler/icons-vue";
import { z } from "zod";
import { autoResizeTextarea } from "../lib/autoResizeTextarea";
import { bridgeBots } from "../lib/bridgeBots";
import { formatDate } from "../lib/formatDate";
import { hostWhitelist } from "../lib/hostWhitelist";
import { postSchema, APIPost } from "../lib/postSchema";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLocationStore } from "../stores/location";
import { useLoginStatusStore } from "../stores/loginStatus";
import { useOnlinelistStore } from "../stores/onlinelist";

const cloudlinkStore = useCloudlinkStore();
const locationStore = useLocationStore();
const loginStatusStore = useLoginStatusStore();
const onlineListStore = useOnlinelistStore();

const { post, inbox, dontUpdate } = defineProps<{
  post: APIPost;
  inbox?: boolean;
  dontUpdate?: boolean;
}>();
const emit = defineEmits<{
  reply: [username: string, postContent: string];
  delete: [];
}>();

const username = ref(
  inbox
    ? post.u === loginStatusStore.username
      ? "Notification"
      : "Announcement"
    : post.u,
);
const postContent = ref(post.p);

const isBridged = bridgeBots.includes(username.value);
if (isBridged) {
  const match = postContent.value.match(/^(.*?): (.*)$/s);
  if (match) {
    username.value = match[1];
    postContent.value = match[2];
  }
}

const isDeleted = ref(false);
const edited = ref<null | APIPost>(null);
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

const goToUser = (username: string) => {
  locationStore.sublocation = username;
  locationStore.location = "users";
};

const remove = async () => {
  if (!confirm("Are you sure you want to delete this post?")) {
    return;
  }
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
    emit("delete");
  } catch (e) {
    alert(e); // i can do error handling!
  }
};

const editing = ref(false);
const editInputValue = ref<HTMLTextAreaElement | null>(null);
effect(() => {
  if (!editInputValue.value) {
    return;
  }
  resizeTextarea();
});
const edit = async (e?: Event) => {
  e?.preventDefault();
  editing.value = false;
  if (!editInputValue.value) {
    return;
  }
  autoResizeTextarea(editInputValue.value);
  const { username, token } = loginStatusStore;
  if (username === null || token === null) {
    return;
  }
  const request = await fetch(
    `https://api.meower.org/posts?id=${post.post_id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        username,
        token,
        id: post.post_id,
      },
      body: JSON.stringify({
        content: editInputValue.value.value,
      }),
    },
  );
  if (request.status !== 200) {
    alert(`Unexpected ${request.status} when editing`);
  }
};

const editKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    if (!e.shiftKey) {
      e.preventDefault();
      edit();
    }
  }
};

const resizeTextarea = () => {
  if (!editInputValue.value) {
    return;
  }
  editInputValue.value.style.height = `${editInputValue.value.scrollHeight}px`;
};

const reload = () => location.reload();

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

const postContentElement = ref<HTMLDivElement | null>(null);
effect(() => {
  if (postContentElement.value === null) {
    return;
  }
  postContentElement.value.querySelectorAll("a").forEach((element) => {
    const text = element.textContent;
    if (!text || !element.textContent?.startsWith("@")) {
      return;
    }
    const user = text.slice(1);
    element.href = "#";
    element.role = "button";
    element.addEventListener("click", (e) => {
      e.preventDefault();
      goToUser(user);
    });
  });
});
</script>

<template>
  <Post :post="edited" v-if="edited" @reply="(u, p) => emit('reply', u, p)" />
  <div
    class="group flex flex-col rounded-xl bg-slate-800 px-2 py-1"
    v-else
    v-if="!isDeleted"
  >
    <div class="relative flex flex-wrap items-center gap-x-2">
      <button class="font-bold" @click="goToUser(username)">
        {{ username }}
      </button>
      <span
        class="inline-block text-green-400"
        v-if="onlineListStore.online.includes(username)"
      >
        <IconCircleFilled class="h-2 w-2" aria-hidden />
        <span class="sr-only">Online</span>
      </span>
      <span
        title="This post was created on the Discord server."
        v-if="post.u === 'Discord'"
      >
        <IconBrandDiscord class="inline-block w-5" aria-hidden />
        <span class="sr-only">
          This post was created on the Discord server.
        </span>
      </span>
      <span
        title="This post was created via a Webhook. These do not go through Meowers account system, anyone can create a message under any name."
        v-if="post.u === 'Webhooks'"
      >
        <IconWebhook class="inline-block w-5" />
        <span class="sr-only">
          This post was created via a Webhook. These do not go through Meowers
          account system, anyone can create a message under any name.
        </span>
      </span>
      <span
        title="This post was created on the Revolt server."
        v-if="post.u === 'RevowerJS'"
      >
        <IconBuildingBridge class="inline-block w-5" />
        <span class="sr-only">
          This post was created on the Revolt server.
        </span>
      </span>
      <div
        class="visible absolute right-0 top-0 ml-auto space-x-3 sm:invisible group-hover:sm:visible"
        v-if="!editing && !inbox"
      >
        <template v-if="post.u === loginStatusStore.username">
          <button class="h-4 w-4" @click="remove">
            <IconTrash aria-hidden />
            <span class="sr-only">Delete</span>
          </button>
          <button class="h-4 w-4" @click="editing = true">
            <IconEdit aria-hidden />
            <span class="sr-only">Edit</span>
          </button>
        </template>
        <button class="h-4 w-4" @click="emit('reply', username, postContent)">
          <IconArrowForward aria-hidden />
          <span class="sr-only">Reply</span>
        </button>
      </div>
      <div
        class="visible w-full text-sm italic text-slate-400 sm:hidden sm:w-auto group-hover:sm:inline-block"
      >
        {{ formatDate(post.t.e) }}
      </div>
    </div>
    <form v-if="editing" @submit="edit">
      <textarea
        class="my-2 block w-full resize-none rounded-lg bg-slate-700 px-2 py-1"
        type="text"
        rows="1"
        :value="postContent"
        ref="editInputValue"
        @keydown="editKeydown"
        @input="resizeTextarea"
      />
      <div class="space-x-2">
        <button type="submit" class="rounded-xl bg-slate-700 px-2 py-1">
          Edit
        </button>
        <button
          class="rounded-xl bg-slate-700 px-2 py-1"
          @click="editing = false"
        >
          Cancel
        </button>
      </div>
    </form>
    <div v-else>
      <div
        class="max-h-96 space-y-2 overflow-y-auto break-words [&_a]:text-sky-400 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-slate-500 [&_blockquote]:pl-2 [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:text-2xl [&_h3]:font-bold [&_h4]:text-xl [&_h4]:font-bold [&_h5]:text-lg [&_h5]:font-bold [&_h6]:text-sm [&_h6]:font-bold [&_hr]:mx-8 [&_hr]:my-2 [&_hr]:border-slate-500 [&_img]:max-h-96 [&_li]:list-inside [&_ol_li]:list-decimal [&_td]:border-[1px] [&_td]:border-slate-500 [&_td]:px-2 [&_td]:py-1 [&_th]:border-[1px] [&_th]:border-slate-500 [&_th]:px-2 [&_th]:py-1 [&_ul_li]:list-disc"
        v-html="markdownPostContent"
        ref="postContentElement"
      ></div>
      <button
        class="mt-2 flex items-center gap-1 rounded-xl bg-slate-700 px-2 py-1"
        v-if="
          postContent.endsWith('\u200c') &&
          username === 'mybearworld' &&
          !isBridged
        "
        @click="reload"
      >
        <IconReload class="inline-block h-5 w-5" />
        Reload
      </button>
    </div>
  </div>
</template>
