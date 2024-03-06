<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { IconChevronDown } from "@tabler/icons-vue";
import {
  DropdownMenuRoot,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "radix-vue";
import { RouterLink } from "vue-router";
import Login from "./Login.vue";
import { useIsDevStore } from "../stores/isDev";

const { t } = useI18n();

const isDevStore = useIsDevStore();
</script>

<template>
  <div>
    <div class="mb-2 flex flex-col items-center gap-1">
      <div class="flex flex-wrap items-center gap-x-4">
        <h1 class="text-3xl font-bold">
          {{ t("roarer") }}
        </h1>
        <Login />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <RouterLink class="flex whitespace-nowrap text-link underline" to="/">
          {{ t("routeHome") }}
        </RouterLink>
        <RouterLink
          class="flex whitespace-nowrap text-link underline"
          to="/inbox"
        >
          {{ t("routeInbox") }}
        </RouterLink>
        <RouterLink
          class="flex whitespace-nowrap text-link underline"
          to="/chats"
        >
          {{ t("routeGroups") }}
        </RouterLink>
        <RouterLink
          class="flex whitespace-nowrap text-link underline"
          to="/users"
        >
          {{ t("routeUsers") }}
        </RouterLink>
        <RouterLink
          class="flex whitespace-nowrap text-link underline"
          to="/settings"
        >
          {{ t("routeSettings") }}
        </RouterLink>
        <DropdownMenuRoot>
          <DropdownMenuTrigger>
            <span
              class="flex items-center whitespace-nowrap text-link underline"
            >
              {{ t("routeRelated") }}
              <IconChevronDown class="h-5 w-5" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent
              class="ml-2 mt-0.5 rounded-xl bg-accent px-2 py-1 text-accent-text shadow-lg"
            >
              <DropdownMenuItem>
                <RouterLink
                  class="flex whitespace-nowrap text-link underline"
                  to="/bot"
                >
                  {{ t("routeRoarBot") }}
                </RouterLink>
                <a
                  class="flex whitespace-nowrap text-link underline"
                  href=https://github.com/mybearworld/roarer
                >
                  {{ t("linkGithub") }}
              </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>
      </div>
      <p v-if="isDevStore.isDev">
        {{ t("inDevelopmentMode") }}
        <a
          href="https://github.com/meower-media-co/Meower-Server/tree/main"
          class="text-link underline"
          target="_blank"
          >Meower Server</a
        >
        -
        <a
          href="https://github.com/meower-media-co/Meower-Svelte/tree/master"
          class="text-link underline"
          target="_blank"
          >Meower Svelte</a
        >
      </p>
    </div>
  </div>
</template>
