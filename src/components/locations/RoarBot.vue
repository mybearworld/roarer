<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Markdown from "../Markdown.vue";

const { t } = useI18n();
</script>

<template>
  <div class="flex max-w-full flex-col items-center gap-5">
    <h2 class="text-6xl font-bold">🤖 {{ t("routeRoarBot") }}</h2>
    <div class="text-3xl">{{ t("roarBotTagline") }}</div>
    <Markdown
      class="max-w-full overflow-x-auto"
      style="max-height: initial"
      md='
```ts
import { Bot } from "roarbot";
import "dotenv/config";

const bot = new Bot(process.env.BOT_USERNAME, process.env.BOT_PASSWORD);
bot.command({
  name: "echo",
  description: "Repeats back exactly what has been said.",
  handler: (ctx) => {
    const [message] = ctx.args("full");
    ctx.reply(message);
  },
});

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_USERNAME: string;
      BOT_PASSWORD: string;
    }
  }
}
```'
    />
    <div class="mt-5">
      <h3 class="inline text-nowrap text-xl font-bold">
        {{ t("roarBotSimple") }}:
      </h3>
      <p class="inline text-xl">
        {{ t("roarBotSimpleDescription") }}
      </p>
    </div>
    <div>
      <h3 class="inline text-nowrap text-xl font-bold">
        {{ t("roarBotTypeSafe") }}:
      </h3>
      <p class="inline text-xl">
        {{ t("roarBotTypeSafeDescription.start") }}<code>ctx.args</code
        >{{ t("roarBotTypeSafeDescription.end") }}
      </p>
    </div>
    <h3 class="mt-10 text-5xl font-bold">{{ t("roarBotTryIt") }}</h3>
    <code class="max-w-full overflow-auto text-center text-2xl">
      npm install https://github.com<wbr />/mybearworld<wbr />/roarbot.git
    </code>
  </div>
</template>
