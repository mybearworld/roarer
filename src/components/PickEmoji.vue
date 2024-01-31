<script setup lang="ts">
import { effect, ref } from "vue";
import { Picker } from "emoji-picker-element";
import {
  EmojiClickEventDetail,
  CustomEmoji,
} from "emoji-picker-element/shared";
import { discordEmoji } from "../lib/discordEmoji";

const emit = defineEmits<{
  emoji: [emoji: EmojiClickEventDetail];
}>();

const picker = new Picker({
  skinToneEmoji: "👍",
  customEmoji: discordEmoji.map(
    (emoji): CustomEmoji => ({
      name: emoji.name,
      url: `https://cdn.discordapp.com/emojis/${emoji.id}.${
        emoji.isGif ? "gif" : "webp"
      }?size=24&quality=lossless`,
      shortcodes: [emoji.emoji],
    }),
  ),
});
picker.addEventListener("emoji-click", (e) => {
  emit("emoji", e.detail);
});

const mainRef = ref<HTMLDivElement | null>();
effect(() => {
  if (!mainRef.value) {
    return;
  }
  mainRef.value.innerHTML = "";
  mainRef.value.append(picker);
});
</script>

<template>
  <div ref="mainRef"></div>
</template>
