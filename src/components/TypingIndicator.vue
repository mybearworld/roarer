<script setup lang="ts">
import { computed, ref } from "vue";
import { IconKeyboard, IconKeyboardOff } from "@tabler/icons-vue";
import { z } from "zod";
import { APIChat } from "../lib/chatSchema";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";

const { chat } = defineProps<{
  chat?: APIChat;
}>();

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();

const typingUsers = ref(new Set<string>());
const shownTypingUsers = computed(() =>
  [...typingUsers.value].filter(
    (item) =>
      item !== loginStatusStore.username &&
      (!chat || chat.members.includes(item)),
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
      <span class="sr-only">Typing users:</span>
      {{ [...shownTypingUsers.values()].join(", ") }}
    </span>
    <span class="italic text-slate-400" v-else>
      <IconKeyboardOff class="inline-block" aria-hidden />
      No one is currently typing.
    </span>
  </p>
</template>
