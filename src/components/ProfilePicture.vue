<script setup lang="ts">
import meowy from "../assets/pfp/22.svg";
import { useI18n } from "vue-i18n";
import { IconCircleFilled } from "@tabler/icons-vue";
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
  }>(),
  {
    online: false,
  },
);

const pfpLink = "pfp" in props.pfp ? profilePictures.get(props.pfp.pfp) : null;

const { t } = useI18n();
</script>

<template>
  <div>
    <img
      :src="`https://uploads.meower.org/icons/${props.pfp.avatar}`"
      :alt="t('profilePictureCustomAlt')"
      :style="{
        padding:
          props.pfp.bg === '!color' || props.pfp.bg === '#!color'
            ? '0'
            : '0.2rem',
        backgroundColor:
          props.pfp.bg === '!color' || props.pfp.bg === '#!color'
            ? 'transparent'
            : (props.pfp.bg.startsWith('#') ? '' : '#') + props.pfp.bg,
      }"
      :class="props.class"
      v-if="'avatar' in props.pfp && props.pfp.avatar !== ''"
    />
    <img
      :src="pfpLink"
      :alt="t('profilePictureAlt', { n: props.pfp.pfp })"
      :class="props.class"
      v-else-if="'pfp' in props.pfp && pfpLink"
    />
    <img
      :src="meowy"
      :class="`brightness-150 grayscale motion-safe:animate-spin motion-safe:[animation-duration:.5s] ${props.class}`"
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
