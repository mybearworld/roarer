<script setup lang="ts">
import meowy from "../assets/pfp/22.svg";
import { useI18n } from "vue-i18n";
import { profilePictures } from "../assets/pfp";

const props = defineProps<{
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
}>();

const pfpLink = "pfp" in props.pfp ? profilePictures.get(props.pfp.pfp) : null;

const { t } = useI18n();
</script>

<template>
  <img
    :src="`https://uploads.meower.org/icons/${props.pfp.avatar}`"
    :alt="t('profilePictureCustomAlt')"
    :style="{
      backgroundColor:
        props.pfp.bg === '!color' || props.pfp.bg === '#!color'
          ? 'transparent'
          : (props.pfp.bg.startsWith('#') ? '' : '#') + props.pfp.bg,
    }"
    v-if="'avatar' in props.pfp && props.pfp.avatar !== ''"
  />
  <img
    :src="pfpLink"
    :alt="t('profilePictureAlt', { n: props.pfp.pfp })"
    v-else-if="'pfp' in props.pfp && pfpLink"
  />
  <img
    :src="meowy"
    class="brightness-150 grayscale motion-safe:animate-spin motion-safe:[animation-duration:.5s]"
    v-else
  />
</template>
