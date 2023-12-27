<script setup lang="ts">
import { computed, ref } from "vue";
import { IconKeyboard } from "@tabler/icons-vue";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useLoginStatusStore } from "../stores/loginStatus";
import { z } from "zod";

const cloudlinkStore = useCloudlinkStore();
const loginStatusStore = useLoginStatusStore();

const typingUsers = ref(new Set<string>());
const shownTypingUsers = computed(() =>
  [...typingUsers.value].filter((item) => item !== loginStatusStore.username),
);

const typingIndicatorSchema = z.object({
  cmd: z.literal("direct"),
  val: z.object({
    u: z.string(),
    state: z.literal(101),
  }),
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
  <p v-if="shownTypingUsers.length">
    <IconKeyboard class="inline-block" />
    {{ [...shownTypingUsers.values()].join(", ") }}
  </p>
</template>
