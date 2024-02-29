import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useDialogStore = defineStore("dialog", () => {
  const dialogs = ref<Dialog[]>([]);
  const shownDialog = computed(() =>
    dialogs.value.length > 0 ? dialogs.value[dialogs.value.length - 1] : null,
  );

  const resolveDialog = <TResolve>(
    dialog: Dialog,
    resolve: (item: TResolve) => void,
    resolveMessage: TResolve,
  ) => {
    dialogs.value.pop();
    resolve(resolveMessage);
  };

  const alert = (message: string): Promise<"ok"> => {
    return new Promise((resolve) => {
      const dialog = {
        type: "alert",
        message,
        okClick: () => resolveDialog(dialog, resolve, "ok"),
      } as const;
      dialogs.value.unshift(dialog);
    });
  };

  const confirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const dialog = {
        type: "confirm",
        message,
        yesClick: () => resolveDialog(dialog, resolve, true),
        noClick: () => resolveDialog(dialog, resolve, false),
      } as const;
      dialogs.value.unshift(dialog);
    });
  };

  const prompt = (
    message: string,
    placeholder: string,
    { password = false } = {},
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      const dialog: Dialog = {
        type: "prompt",
        message,
        placeholder,
        password,
        okClick: (response) => resolveDialog(dialog, resolve, response),
        cancelClick: () => resolveDialog(dialog, resolve, null),
      } as const;
      dialogs.value.unshift(dialog);
    });
  };

  return { shownDialog, alert, confirm, prompt };
});

export type Dialog =
  | {
      type: "alert";
      message: string;
      okClick: () => void;
    }
  | {
      type: "confirm";
      message: string;
      yesClick: () => void;
      noClick: () => void;
    }
  | {
      type: "prompt";
      message: string;
      placeholder: string;
      password: boolean;
      okClick: (response: string) => void;
      cancelClick: () => void;
    };
