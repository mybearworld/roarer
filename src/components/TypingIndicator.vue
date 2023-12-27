<script setup lang="ts">
import { ref } from "vue";
import { IconKeyboard } from "@tabler/icons-vue";
import { useCloudlinkStore } from "../stores/cloudlink";
import { z } from "zod";

const cloudlinkStore = useCloudlinkStore();

const typingUsers = ref(new Set<string>());

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
  <p v-if="typingUsers.size">
    <IconKeyboard class="inline-block" />
    {{ [...typingUsers.values()].join(", ") }}
  </p>
</template>
