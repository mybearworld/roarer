<script setup lang="ts">
import { ref } from "vue";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogRoot,
} from "radix-vue";
import { useI18n } from "vue-i18n";
import { useDialogStore } from "../stores/dialog";

const dialogStore = useDialogStore();
const { t } = useI18n();

const promptResponse = ref("");
</script>

<template>
  <DialogRoot :open="!!dialogStore.shownDialog" v-if="dialogStore.shownDialog">
    <DialogPortal>
      <DialogOverlay
        class="fixed left-0 top-0 h-full w-full bg-background opacity-40"
      />
      <div
        class="fixed left-0 top-0 flex h-full w-full items-center justify-center"
      >
        <DialogContent
          class="space-y-2 rounded-xl px-2 py-1 filled:bg-accent filled:text-accent-text bordered:border-2 bordered:border-accent"
        >
          <DialogTitle class="sr-only">
            {{ t(`dialogTitle_${dialogStore.shownDialog.type}`) }}
          </DialogTitle>
          <DialogDescription>
            {{ dialogStore.shownDialog.message }}
          </DialogDescription>
          <DialogClose
            class="rounded-xl px-2 py-1 filled:bg-background filled:text-text bordered:bg-accent bordered:text-accent-text"
            @click="dialogStore.shownDialog.okClick()"
            v-if="dialogStore.shownDialog.type === 'alert'"
          >
            {{ t("okButton") }}
          </DialogClose>
          <div
            class="space-x-2"
            v-else-if="dialogStore.shownDialog.type === 'confirm'"
          >
            <DialogClose
              class="rounded-xl px-2 py-1 filled:bg-background filled:text-text bordered:bg-accent bordered:text-accent-text"
              @click="dialogStore.shownDialog.yesClick()"
            >
              {{ t("yesButton") }}
            </DialogClose>
            <DialogClose
              class="rounded-xl px-2 py-1 filled:bg-background filled:text-text bordered:bg-accent bordered:text-accent-text"
              @click="dialogStore.shownDialog.noClick()"
            >
              {{ t("noButton") }}
            </DialogClose>
          </div>
          <template v-else-if="dialogStore.shownDialog.type === 'prompt'">
            <input
              :type="dialogStore.shownDialog.password ? 'password' : 'text'"
              class="rounded-lg border-2 bg-transparent px-2 py-1 filled:border-background bordered:border-accent"
              @input="
                (event) => {
                  promptResponse = (event.target as HTMLInputElement).value;
                }
              "
              :placeholder="dialogStore.shownDialog.placeholder"
            />
            <div class="space-x-2">
              <DialogClose
                class="rounded-xl px-2 py-1 filled:bg-background filled:text-text bordered:bg-accent bordered:text-accent-text"
                @click="
                  promptResponse = '';
                  dialogStore.shownDialog.okClick(promptResponse);
                "
              >
                {{ t("okButton") }}
              </DialogClose>
              <DialogClose
                class="rounded-xl px-2 py-1 filled:bg-background filled:text-text bordered:bg-accent bordered:text-accent-text"
                @click="dialogStore.shownDialog.cancelClick()"
              >
                {{ t("cancelButton") }}
              </DialogClose>
            </div>
          </template>
        </DialogContent>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>
