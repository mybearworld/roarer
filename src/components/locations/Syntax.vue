<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { hostWhitelist } from "../../lib/hostWhitelist";

const { t } = useI18n();
</script>

<template>
  <h2 class="text-2xl font-bold">{{ t("syntax") }}</h2>
  <p>
    {{ t("syntaxMarkdown.start")
    }}<a
      href="https://www.markdownguide.org/cheat-sheet/"
      class="text-link underline"
      target="_blank"
      >{{ t("syntaxMarkdown.link") }}</a
    >{{ t("syntaxMarkdown.end") }}
  </p>
  <p>{{ t("syntaxExtensions") }}</p>
  <h3 class="text-xl font-bold">{{ t("syntaxAttachments") }}</h3>
  <p>{{ t("syntaxAttachmentsDescription") }}</p>
  <details>
    <summary class="cursor-pointer">{{ t("syntaxImageHosts") }}</summary>
    <ul class="list-inside list-disc">
      <li v-for="host of hostWhitelist">
        <a :href="host" class="text-link underline" target="_blank">{{
          host
        }}</a>
      </li>
    </ul>
  </details>
  <h3 class="text-xl font-bold">{{ t("syntaxSyntaxHighlighting") }}</h3>
  <p>{{ t("syntaxSyntaxHighlightingDescription") }}</p>
  <h3 class="text-xl font-bold">{{ t("syntaxScratchBlocks") }}</h3>
  <p>
    {{ t("syntaxScratchBlocksDescription.start")
    }}<a
      href="https://scratchblocks.github.io/"
      class="text-link underline"
      target="_blank"
      >{{ t("syntaxScratchBlocksDescription.link") }}</a
    >{{ t("syntaxScratchBlocksDescription.end") }}
  </p>
</template>
