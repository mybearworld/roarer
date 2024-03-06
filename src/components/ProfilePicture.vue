<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { profilePictures } from "../assets/pfp";

const props = defineProps<
  | {
      avatar: string;
      pfp: number;
    }
  | {
      avatar: string;
      pfp: undefined;
    }
  | {
      avatar: undefined;
      pfp: number;
    }
>();

const { t } = useI18n();
</script>

<template>
  <img
    :src="`https://uploads.meower.org/icons/${props.avatar}`"
    :alt="t('profilePictureCustomAlt')"
    v-if="props.avatar !== undefined && props.avatar !== ''"
  />
  <img
    :src="profilePictures.get(props.pfp!)"
    :alt="t('profilePictureAlt', { n: props.pfp })"
    v-else
  />
</template>
