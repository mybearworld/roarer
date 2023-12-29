export const autoResizeTextarea = (el: HTMLTextAreaElement) => {
  el.style.maxHeight = "0px";
  el.style.height = `${el.scrollHeight}px`;
  el.style.maxHeight = "";
};

export const resetTextareaSize = (el: HTMLTextAreaElement) => {
  el.style.height = "";
};
