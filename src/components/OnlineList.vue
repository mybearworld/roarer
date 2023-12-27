<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { useCloudlinkStore } from "../stores/cloudlink";

const cloudlinkStore = useCloudlinkStore();

const onlineUsers = ref<string[]>([]);

cloudlinkStore.cloudlink.on("ulist", (packet: unknown) => {
  console.log(onlineUsers.value);
  const online = z.object({ val: z.string() }).parse(packet);
  onlineUsers.value = online.val.split(";").slice(0, -1);
});
</script>

<template>
  <p>Online users ({{ onlineUsers.length }}): {{ onlineUsers.join(", ") }}</p>
</template>
