<script setup lang="ts">
import { computed, effect, ref } from "vue";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import linkifyHtml from "linkify-html";
import "linkify-plugin-mention";
import markdownit from "markdown-it";
// @ts-expect-error - the type definitions aren't correct
import { full as emoji } from "markdown-it-emoji";
import Token from "markdown-it/lib/token";
import {
  IconAlertTriangle,
  IconArrowForward,
  IconBrandDiscord,
  IconBuildingBridge,
  IconCircleFilled,
  IconEdit,
  IconSailboat,
  IconReload,
  IconTrash,
  IconWebhook,
} from "@tabler/icons-vue";
import { useI18n } from "vue-i18n";
import { z } from "zod";
import { autoResizeTextarea } from "../lib/autoResizeTextarea";
import { apiRequest } from "../lib/apiRequest";
import { bridgeBots } from "../lib/bridgeBots";
import { formatDate } from "../lib/formatDate";
import { hostWhitelist } from "../lib/hostWhitelist";
import { postSchema, APIPost } from "../lib/postSchema";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLocationStore } from "../stores/location";
import { useLoginStatusStore } from "../stores/loginStatus";
import { useOnlinelistStore } from "../stores/onlinelist";
import { useRelationshipStore } from "../stores/relationship";

const cloudlinkStore = useCloudlinkStore();
const locationStore = useLocationStore();
const loginStatusStore = useLoginStatusStore();
const onlineListStore = useOnlinelistStore();
const relationshipStore = useRelationshipStore();
const { t, locale } = useI18n();

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

const isItalicUser = computed(() =>
  ["Server", "Notification", "Announcement"].includes(username.value),
);

const separatePost = (content: string) => {
  const match = content.match(/^(.*?): (.*)$/s);
  if (match) {
    username.value = match[1];
    postContent.value = match[2];
  }
};

const isBridged = bridgeBots.includes(username.value);
if (isBridged) {
  separatePost(postContent.value);
}
const isSplash = post.u === "Webhooks" && username.value === "SplashBridge";
if (isSplash) {
  separatePost(postContent.value);
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
  if (!confirm(t("deletePostConfirm"))) {
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
  const response = await apiRequest(`/posts?id=${post.post_id}`, {
    method: "PATCH",
    auth: loginStatusStore,
    body: JSON.stringify({
      content: editInputValue.value.value,
    }),
  });
  if (response.status !== 200) {
    alert(`Unexpected ${response.status} when editing`);
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

const report = async () => {
  const reason = prompt("Reason:");
  if (!reason) {
    return;
  }
  if (!confirm(t("confirmReport", { reason, post: post.p }))) {
    return;
  }
  try {
    await cloudlinkStore.send(
      {
        cmd: "report",
        val: {
          type: 0,
          id: post.post_id,
          reason,
          comment: "Reported with Roarer.",
        },
      },
      z.object({}), // for obvious reasons, reports aren't public and there's no response associated with them
    );
  } catch {}
  alert(t("reportSuccess"));
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
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(str, { language: lang }).value;
    }
    return "";
  },
}).use(emoji, { shortcuts: {} });

const IMAGE_REGEX = /\[([^\]]+?): (?! )([^\]]+?)\]/g;
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
  postContentElement.value.querySelectorAll("img").forEach(async (element) => {
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
});
</script>

<template>
  <Post
    :post="edited"
    v-if="edited && !relationshipStore.blockedUsers.has(username)"
    @reply="(u, p) => emit('reply', u, p)"
  />
  <div
    class="group flex flex-col rounded-xl bg-slate-800 px-2 py-1"
    v-else
    v-if="!isDeleted && !relationshipStore.blockedUsers.has(username)"
  >
    <div class="relative flex flex-wrap items-center gap-x-2">
      <button
        v-if="!isItalicUser"
        class="font-bold"
        @click="goToUser(username)"
      >
        {{ username }}
      </button>
      <span
        class="inline-block text-green-400"
        v-if="onlineListStore.online.includes(username)"
      >
        <IconCircleFilled class="h-2 w-2" aria-hidden />
        <span class="sr-only">Online</span>
      </span>
      <span :title="t('discordBridgePost')" v-if="post.u === 'Discord'">
        <IconBrandDiscord class="inline-block w-5" aria-hidden />
        <span class="sr-only">{{ t("discordBridgePost") }}</span>
      </span>
      <span
        :title="t('webhookBridgePost')"
        v-if="post.u === 'Webhooks' && !isSplash"
      >
        <IconWebhook class="inline-block w-5" />
        <span class="sr-only">{{ t("webhookBridgePost") }}</span>
      </span>
      <span :title="t('splashBridgePost')" v-if="isSplash">
        <IconSailboat class="inline-block w-5" />
        <span class="sr-only">{{ t("splashBridgePost") }}</span>
      </span>
      <span :title="t('revoltBridgePost')" v-if="post.u === 'RevowerJS'">
        <IconBuildingBridge class="inline-block w-5" />
        <span class="sr-only">{{ t("revoltBridgePost") }}</span>
      </span>
      <div
        class="visible absolute right-0 top-0 ml-auto space-x-3 sm:invisible group-hover:sm:visible"
        v-if="!editing && !inbox"
      >
        <template v-if="post.u === loginStatusStore.username">
          <button class="h-4 w-4" @click="remove">
            <IconTrash aria-hidden />
            <span class="sr-only">{{ t("deletePost") }}</span>
          </button>
          <button class="h-4 w-4" @click="editing = true">
            <IconEdit aria-hidden />
            <span class="sr-only">{{ t("editPost") }}</span>
          </button>
        </template>
        <button
          class="h-4 w-4"
          @click="report"
          v-if="post.u !== loginStatusStore.username"
        >
          <IconAlertTriangle aria-hidden />
          <span class="sr-only">{{ t("reportPost") }}</span>
        </button>
        <button class="h-4 w-4" @click="emit('reply', username, postContent)">
          <IconArrowForward aria-hidden />
          <span class="sr-only">{{ t("replyPost") }}</span>
        </button>
      </div>
      <div
        :class="`visible w-full text-sm italic text-slate-400 ${
          !isItalicUser ? 'sm:hidden sm:w-auto group-hover:sm:inline-block' : ''
        }`"
      >
        {{ formatDate(post.t.e, locale) }}
        <span v-if="edited || post.edited_at">(edited)</span>
      </div>
    </div>
    <form v-if="editing" @submit="edit">
      <textarea
        class="my-2 block w-full resize-none rounded-lg bg-slate-700 px-2 py-1"
        type="text"
        rows="1"
        :value="post.unfiltered_p ?? postContent"
        ref="editInputValue"
        @keydown="editKeydown"
        @input="resizeTextarea"
      />
      <div class="space-x-2">
        <button type="submit" class="rounded-xl bg-slate-700 px-2 py-1">
          {{ t("editPost") }}
        </button>
        <button
          class="rounded-xl bg-slate-700 px-2 py-1"
          @click="editing = false"
        >
          {{ t("cancelEditingPost") }}
        </button>
      </div>
    </form>
    <div v-else>
      <div
        :class="`max-h-96 space-y-2 overflow-y-auto break-words [&_a]:text-sky-400 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-slate-500 [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:text-slate-400 [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:text-2xl [&_h3]:font-bold [&_h4]:text-xl [&_h4]:font-bold [&_h5]:text-lg [&_h5]:font-bold [&_h6]:text-sm [&_h6]:font-bold [&_hr]:mx-8 [&_hr]:my-2 [&_hr]:border-slate-500 [&_img]:max-h-96 [&_li]:list-inside [&_ol_li]:list-decimal [&_td]:border-[1px] [&_td]:border-slate-500 [&_td]:px-2 [&_td]:py-1 [&_th]:border-[1px] [&_th]:border-slate-500 [&_th]:px-2 [&_th]:py-1 [&_ul_li]:list-disc ${
          isItalicUser ? 'italic' : ''
        }`"
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
        <IconReload class="inline-block h-5 w-5" aria-hidden />
        {{ t("reloadPostButton") }}
      </button>
    </div>
  </div>
</template>
