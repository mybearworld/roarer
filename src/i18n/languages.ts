import { en } from "./en";
import { es } from "./es";
import { de } from "./de";
import { hu } from "./hu";
import { tok } from "./tok";

const messagesAmount = Object.keys(en).length;

export const languages = Object.fromEntries(
  Object.entries({
    en,
    es,
    de,
    hu,
    tok,
  } as const).map(([langName, messages]) => [
    langName,
    {
      ...messages,
      percentageDone: `${Math.round(
        100 -
          ((messagesAmount - Object.keys(messages).length) / messagesAmount) *
            100,
      )}%`,
    },
  ]),
);
