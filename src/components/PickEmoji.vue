<script setup lang="ts">
import { effect, ref } from "vue";
import { Picker } from "emoji-picker-element";
import {
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "radix-vue";
import { useI18n } from "vue-i18n";
import {
  EmojiClickEventDetail,
  CustomEmoji,
} from "emoji-picker-element/shared";
import {
  discordEmoji,
  discordStickers,
  DiscordSticker,
} from "../lib/discordEmoji";

const emit = defineEmits<{
  emoji: [emoji: EmojiClickEventDetail];
  sticker: [sticker: DiscordSticker];
}>();

const { t, locale } = useI18n();

const picker = new Picker({
  i18n: JSON.parse(decodeURIComponent(t("emojiPicker"))),
  locale: locale.value,
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
  <TabsRoot>
    <TabsList class="flex gap-2">
      <TabsTrigger
        class="text-link underline data-[state=active]:font-bold data-[state=active]:text-accent-text data-[state=active]:no-underline"
        value="emoji"
        >{{ t("emojiPickerTabEmoji") }}</TabsTrigger
      >
      <TabsTrigger
        class="text-link underline data-[state=active]:font-bold data-[state=active]:text-accent-text data-[state=active]:no-underline"
        value="stickers"
      >
        {{ t("emojiPickerTabStickers") }}
      </TabsTrigger>
    </TabsList>
    <TabsContent value="emoji"> <div ref="mainRef"></div> </TabsContent>
    <TabsContent value="stickers">
      <div class="mt-2 grid grid-cols-3 gap-2">
        <button
          @click="emit('sticker', sticker)"
          v-for="sticker in discordStickers"
        >
          <img class="w-28 rounded-xl" :src="sticker.url" :alt="sticker.name" />
        </button>
      </div>
    </TabsContent>
  </TabsRoot>
</template>
