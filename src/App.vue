<script setup lang="ts">
import { ref } from "vue";
import { useCloudlinkStore } from "./stores/cloudlink";

const cloudlinkStore = useCloudlinkStore();

const packets = ref<unknown[]>([]);
cloudlinkStore.cloudlink.on("packet", (packet: unknown) => {
  packets.value.push(packet);
});
</script>

<template>
  <h1>Roarer</h1>
  <h2>Packets:</h2>
  <ul>
    <li v-for="packet in packets">{{ JSON.stringify(packet) }}</li>
  </ul>
</template>
