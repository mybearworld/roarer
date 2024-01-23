export const autoResizeTextarea = (el: HTMLTextAreaElement) => {
  requestAnimationFrame(() => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 4}px`;
  });
};

export const resetTextareaSize = (el: HTMLTextAreaElement) => {
  el.style.height = "";
};
