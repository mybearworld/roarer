import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useDialogStore = defineStore("dialog", () => {
  const dialogs = ref<Dialog[]>([]);
  const shownDialog = computed(() =>
    dialogs.value.length > 0 ? dialogs.value[dialogs.value.length - 1] : null,
  );

  const resolveDialog = <TResolve>(
    // TODO: Entirely delete this argument
    _dialog: Dialog,
    resolve: (item: TResolve) => void,
    resolveMessage: TResolve,
  ) => {
    dialogs.value.pop();
    resolve(resolveMessage);
  };

  const alert = (message: string, closable = true): Promise<"ok"> => {
    return new Promise((resolve) => {
      const dialog = {
        type: "alert",
        message,
        okClick: () => resolveDialog(dialog, resolve, "ok"),
        closable,
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

  const closeAlert = () => {
    if (shownDialog.value?.type !== "alert") return;
    shownDialog.value.okClick();
  };

  return { shownDialog, alert, confirm, prompt, closeAlert };
});

export type Dialog =
  | {
      type: "alert";
      message: string;
      okClick: () => void;
      closable: boolean;
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
