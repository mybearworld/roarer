<script setup lang="ts">
import meowy from "../assets/pfp/22.svg";
import { useI18n } from "vue-i18n";
import { profilePictures } from "../assets/pfp";

const props = withDefaults(
  defineProps<{
    pfp:
      | {
          avatar: string;
          bg: string;
          pfp: number;
        }
      | {
          avatar: string;
          bg: string;
        }
      | {
          pfp: number;
        };
    online?: boolean;
    class?: string;
    width?: number;
    height?: number;
  }>(),
  {
    online: false,
  },
);

const imageClass = props.class + " rounded-xl";

const pfpLink = "pfp" in props.pfp ? profilePictures.get(props.pfp.pfp) : null;

const { t } = useI18n();
</script>

<template>
  <div :class="`relative ${props.class}`">
    <img
      :src="`https://uploads.meower.org/icons/${props.pfp.avatar}`"
      :alt="t('profilePictureCustomAlt')"
      :style="{
        borderStyle: props.pfp.bg.endsWith('!color') ? 'none' : 'solid',
        borderWidth: '2px',
        borderColor: props.pfp.bg.endsWith('!color')
          ? ''
          : (props.pfp.bg.startsWith('#') ? '' : '#') + props.pfp.bg,
      }"
      :class="imageClass"
      :width="props.width"
      :height="props.height"
      v-if="'avatar' in props.pfp && props.pfp.avatar !== ''"
    />
    <img
      :src="pfpLink"
      :alt="t('profilePictureAlt', { n: props.pfp.pfp })"
      :class="imageClass"
      :width="props.width"
      :height="props.height"
      v-else-if="'pfp' in props.pfp && pfpLink"
    />
    <img
      :src="meowy"
      :class="`brightness-150 grayscale motion-safe:animate-spin motion-safe:[animation-duration:.5s] ${imageClass}`"
      :width="props.width"
      :height="props.height"
      v-else
    />
    <span
      class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border border-green-950 bg-green-500"
      v-if="props.online"
    >
      <span class="sr-only">Online</span>
    </span>
  </div>
</template>
