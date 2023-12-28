<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { useCloudlinkStore } from "../stores/cloudlink";
import { useOnlinelistStore } from "../stores/onlinelist";

const cloudlinkStore = useCloudlinkStore();
const onlineListStore = useOnlinelistStore();
</script>

<template>
  <details>
    <summary class="cursor-pointer">
      Online users ({{ onlineListStore.online.length }})
    </summary>
    {{ onlineListStore.online.join(", ") }}
  </details>
</template>
