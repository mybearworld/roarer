<script setup lang="ts">
import { computed, ref } from "vue";
import { IconKeyboard, IconKeyboardOff } from "@tabler/icons-vue";
import { useI18n } from "vue-i18n";
import { z } from "zod";
import { APIChat } from "../lib/chatSchema";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";
import { useRelationshipStore } from "../stores/relationship";

const { chat } = defineProps<{
  chat?: APIChat;
}>();

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();
const relationshipStore = useRelationshipStore();
const { t } = useI18n();

const typingUsers = ref(new Set<string>());
const shownTypingUsers = computed(() =>
  [...typingUsers.value].filter(
    (item) =>
      item !== loginStatusStore.username &&
      (!chat || chat.members.includes(item)) &&
      !relationshipStore.blockedUsers.has(item),
  ),
);

const typingIndicatorSchema = z.object({
  cmd: z.literal("direct"),
  val: z
    .object({
      u: z.string(),
      state: z.literal(chat ? 100 : 101),
    })
    .and(
      chat
        ? z.object({
            chatid: z.literal(chat._id),
          })
        : z.object({}),
    ),
});
cloudlinkStore.cloudlink.on("direct", (packet: unknown) => {
  const safeTypingIndicator = typingIndicatorSchema.safeParse(packet);
  if (!safeTypingIndicator.success) {
    return;
  }
  typingUsers.value.add(safeTypingIndicator.data.val.u);
  typingUsers.value = typingUsers.value;
  setTimeout(() => {
    typingUsers.value.delete(safeTypingIndicator.data.val.u);
    typingUsers.value = typingUsers.value;
  }, 3000);
});
</script>

<template>
  <p>
    <span v-if="shownTypingUsers.length">
      <IconKeyboard class="inline-block" aria-hidden />
      <span class="sr-only">{{ t("typingUsers") }}</span>
      {{ [...shownTypingUsers.values()].join(", ") }}
    </span>
    <span class="italic text-slate-400" v-else>
      <IconKeyboardOff class="inline-block" aria-hidden />
      {{ t("noTypingUsers") }}
    </span>
  </p>
</template>
