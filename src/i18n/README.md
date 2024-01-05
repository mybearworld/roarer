# Translations

This directory houses the translation files for Roarer. Contributing is very easy!

## Updating a current translation

### Fixing a mistake

To fix a mistake, you can simply go to the file, find the string and make the change. No additional steps required!

### Adding new strings

To add new strings, go to the [`en.ts`](./en.ts) file. You should see the new strings at the end of that file. Copy and paste the translations over, and translate them.

## Creating a new language

New languages are very welcome! Simply copy and paste the [`en.ts`](./en.ts) file, give it the name of the shortcode of the new language. Then, add your language to the imports of [`languages.ts`](./languages.ts). This should be alphabetical - for example, if `aa` and `cc` are translated, and you want to add `bb`, it looks like this:

```ts
import { aa } from "./aa";
import { bb } from "./bb"; // <- the new line!
import { cc } from "./cc";
```

Then, add your language in the same place in the object. Now, you can translate away!
