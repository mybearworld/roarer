<script setup lang="ts">
import { computed, effect, reactive, ref } from "vue";
import {
  IconAlertTriangle,
  IconArrowForward,
  IconBrandDiscord,
  IconBuildingBridge,
  IconCircleFilled,
  IconEdit,
  IconLink,
  IconSailboat,
  IconReload,
  IconTrash,
  IconWebhook,
} from "@tabler/icons-vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { z } from "zod";
import Markdown from "./Markdown.vue";
import { autoResizeTextarea } from "../lib/autoResizeTextarea";
import { apiRequest, getResponseFromAPIRequest } from "../lib/apiRequest";
import { addOntoPost } from "../lib/addOntoPost";
import { formatDate } from "../lib/formatDate";
import { getPostInfo } from "../lib/postInfo";
import { postSchema, APIPost } from "../lib/schemas/post";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useAuthStore } from "../stores/auth";
import { useOnlinelistStore } from "../stores/onlinelist";
import { useRelationshipStore } from "../stores/relationship";
import { useSettingsStore } from "../stores/settings";

const cloudlinkStore = useCloudlinkStore();
const authStore = useAuthStore();
const onlineListStore = useOnlinelistStore();
const relationshipStore = useRelationshipStore();
const settingsStore = useSettingsStore();
const { t } = useI18n();

const {
  post: rawPost,
  inbox,
  dontUpdate,
  reply,
  isChatOwner,
} = defineProps<{
  post: APIPost;
  inbox?: boolean;
  dontUpdate?: boolean;
  reply?: boolean;
  isChatOwner?: boolean;
  hideControls?: boolean;
}>();
const emit = defineEmits<{
  reply: [username: string, postContent: string, postId: string];
  delete: [];
}>();

const post = addOntoPost(rawPost);

const postInfo = getPostInfo(post, { inbox });

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

const remove = async () => {
  if (!confirm(t("deletePostConfirm"))) {
    return;
  }
  const response = await apiRequest(`/posts?id=${post.post_id}`, {
    method: "DELETE",
    auth: true,
  });
  if (response.status !== 200) {
    alert(t("deletePostFail", { status: response.status }));
    return;
  }
  emit("delete");
};

const editing = ref(false);
const editInputValue = ref<HTMLTextAreaElement | null>(null);
effect(() => {
  if (!editInputValue.value) {
    return;
  }
  autoResizeTextarea(editInputValue.value);
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
    auth: true,
    body: JSON.stringify({
      content: editInputValue.value.value,
    }),
  });
  if (response.status !== 200) {
    alert(t("editPostFail", { status: response.status }));
  }
};

const editKeydown = (e: KeyboardEvent) => {
  if (
    e.key === "Enter" &&
    ((!e.shiftKey && settingsStore.enterSends) ||
      (e.shiftKey && !settingsStore.enterSends))
  ) {
    e.preventDefault();
    edit();
  }
};

const replyPost = ref<APIPost | string | null>(null);
effect(async () => {
  if (!postInfo.reply) {
    return;
  }
  if (!postInfo.reply.id) {
    replyPost.value = postInfo.reply.replyText;
    return;
  }
  const response = await getResponseFromAPIRequest(
    `/posts?id=${postInfo.reply.id}`,
    {
      schema: postSchema,
      auth: true,
    },
  );
  if ("status" in response) {
    replyPost.value = postInfo.reply.replyText;
    return;
  }
  replyPost.value = response;
});

const report = async () => {
  const reason = prompt(t("reportReason"));
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

const reload = () => location.reload();
</script>

<template>
  <Post
    :post="edited"
    :reply="reply"
    v-if="edited && !relationshipStore.blockedUsers.has(postInfo.username)"
    @reply="(u, p) => emit('reply', u, p, post.post_id)"
  />
  <div
    :class="`group flex rounded-xl ${
      settingsStore.theme.roarer_postStyle === 'filled'
        ? 'bg-accent text-accent-text'
        : 'border-2 border-accent bg-transparent'
    } ${
      reply
        ? 'gap-2 border-none italic text-text opacity-40'
        : 'flex-col px-2 py-1'
    }`"
    v-else
    v-if="!isDeleted && !relationshipStore.blockedUsers.has(postInfo.username)"
  >
    <div class="relative flex items-center gap-x-2">
      <IconArrowForward class="inline-block" aria-hidden v-if="reply" />
      <RouterLink
        v-if="!postInfo.italic"
        class="whitespace-nowrap font-bold"
        :to="`/users/${postInfo.username}`"
      >
        {{ postInfo.username }}
      </RouterLink>
      <span
        class="inline-block text-green-400"
        v-if="
          onlineListStore.online.includes(postInfo.username) &&
          !reply &&
          !postInfo.italic
        "
      >
        <IconCircleFilled class="h-2 w-2" aria-hidden />
        <span class="sr-only">Online</span>
      </span>
      <span :title="t('discordBridgePost')" v-if="post.u === 'Discord'">
        <IconBrandDiscord class="inline-block w-5" aria-hidden />
        <span class="sr-only">{{ t("discordBridgePost") }}</span>
      </span>
      <span :title="t('webhookBridgePost')" v-if="post.u === 'Webhooks'">
        <IconWebhook class="inline-block w-5" />
        <span class="sr-only">{{ t("webhookBridgePost") }}</span>
      </span>
      <span :title="t('splashBridgePost')" v-if="post.u === 'SplashBridge'">
        <IconSailboat class="inline-block w-5" />
        <span class="sr-only">{{ t("splashBridgePost") }}</span>
      </span>
      <span :title="t('revoltBridgePost')" v-if="post.u === 'RevowerJS'">
        <IconBuildingBridge class="inline-block w-5" />
        <span class="sr-only">{{ t("revoltBridgePost") }}</span>
      </span>
      <div
        class="visible absolute right-0 top-0 z-10 ml-auto space-x-3 sm:invisible group-hover:sm:visible"
        v-if="!editing && !inbox && !reply && !hideControls"
      >
        <button class="h-4 w-4" v-if="post.post_origin === 'home'">
          <RouterLink :to="`/posts/${post.post_id}`">
            <IconLink aria-hidden />
            <span class="sr-only">{{ t("deletePost") }}</span>
          </RouterLink>
        </button>
        <button
          class="h-4 w-4"
          @click="remove"
          v-if="isChatOwner || post.u === authStore.username"
        >
          <IconTrash aria-hidden />
          <span class="sr-only">{{ t("deletePost") }}</span>
        </button>
        <button
          class="h-4 w-4"
          @click="editing = true"
          v-if="post.u === authStore.username"
        >
          <IconEdit aria-hidden />
          <span class="sr-only">{{ t("editPost") }}</span>
        </button>
        <button
          class="h-4 w-4"
          @click="report"
          v-if="post.u !== authStore.username && authStore.isLoggedIn"
        >
          <IconAlertTriangle aria-hidden />
          <span class="sr-only">{{ t("reportPost") }}</span>
        </button>
        <button
          class="h-4 w-4"
          @click="
            emit('reply', postInfo.username, postInfo.content, post.post_id)
          "
          v-if="authStore.isLoggedIn"
        >
          <IconArrowForward aria-hidden />
          <span class="sr-only">{{ t("replyPost") }}</span>
        </button>
      </div>
      <div
        :class="`visible w-full text-sm italic opacity-40 ${
          !postInfo.italic && !hideControls
            ? 'hidden w-auto group-hover:sm:inline-block'
            : ''
        }`"
        v-if="!reply"
      >
        {{ formatDate(post.t.e) }}
        <span v-if="edited || post.edited_at">(edited)</span>
      </div>
    </div>
    <div
      :class="`w-full text-sm italic opacity-40 sm:hidden ${
        !postInfo.italic ? 'inline-block w-auto' : ''
      }`"
      v-if="!reply && !postInfo.italic && !hideControls"
    >
      {{ formatDate(post.t.e) }}
      <span v-if="edited || post.edited_at">(edited)</span>
    </div>
    <div
      class="overflow-hidden"
      v-if="replyPost && typeof replyPost !== 'string' && !reply && !editing"
    >
      <Post :post="replyPost" reply />
    </div>
    <form class="mt-2" v-if="editing" @submit="edit">
      <textarea
        :class="`mb-2 block w-full resize-none overflow-hidden rounded-lg border-2 bg-transparent px-2 py-1 ${
          settingsStore.theme.roarer_postStyle === 'filled'
            ? 'border-background'
            : 'border-accent'
        }`"
        type="text"
        rows="1"
        :value="post.unfiltered_p ?? post.p"
        ref="editInputValue"
        @keydown="editKeydown"
        @input="editInputValue && autoResizeTextarea(editInputValue)"
      />
      <div class="space-x-2">
        <button
          type="submit"
          :class="`rounded-xl px-2 py-1 ${
            settingsStore.theme.roarer_postStyle === 'filled'
              ? 'bg-background text-text'
              : 'bg-accent text-accent-text'
          }`"
        >
          {{ t("editPost") }}
        </button>
        <button
          :class="`rounded-xl px-2 py-1 ${
            settingsStore.theme.roarer_postStyle === 'filled'
              ? 'bg-background text-text'
              : 'bg-accent text-accent-text'
          }`"
          type="button"
          @click="editing = false"
        >
          {{ t("cancelEditingPost") }}
        </button>
      </div>
    </form>
    <div :class="editing ? 'hidden' : ''">
      <div
        :class="`${postInfo.italic ? 'italic' : ''} ${
          reply ? 'line-clamp-1 overflow-hidden' : 'overflow-y-auto'
        }`"
      >
        <Markdown
          :md="`${typeof replyPost === 'string' ? replyPost : ''}${
            postInfo.content
          }`"
          :inline="reply"
          :noImages="reply"
        />
      </div>
      <button
        :class="`mt-2 flex items-center gap-1 rounded-xl px-2 py-1 ${
          settingsStore.theme.roarer_postStyle === 'filled'
            ? 'bg-background text-text'
            : 'bg-accent text-accent-text'
        }`"
        v-if="
          postInfo.content.endsWith('\u200c') &&
          postInfo.username === 'mybearworld' &&
          !postInfo.bridged &&
          !reply
        "
        @click="reload"
      >
        <IconReload class="inline-block h-5 w-5" aria-hidden />
        {{ t("reloadPostButton") }}
      </button>
    </div>
  </div>
</template>
