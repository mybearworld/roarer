import { z } from "zod";
import { useAuthStore } from "../stores/auth";

export const upload = async (
  file: File,
  type: "icons" | "attachments",
): Promise<UploadReturn<UploadedImage>> => {
  const authStore = useAuthStore();
  if (!authStore.token) {
    throw new Error("Need to be logged in for uploading");
  }

  const maxSize = type === "icons" ? 5 << 20 : 25 << 20;
  if (file.size > maxSize) {
    return {
      error: "tooLarge",
      maxSize,
      readableMaxSize: shortenBytes(maxSize),
    };
  }
  const form = new FormData();
  form.set("file", file);
  const image = imageSchema.parse(
    await (
      await fetch(`https://uploads.meower.org/${type}`, {
        method: "POST",
        body: form,
        headers: {
          Authorization: authStore.token,
        },
      })
    ).json(),
  );

  return { error: null, image };
};
/**
 * Thank you, StackOverflow :)
 * https://stackoverflow.com/a/42408230
 */
const shortenBytes = (n: number) => {
  const k = n > 0 ? Math.floor(Math.log2(n) / 10) : 0;
  const rank = (k > 0 ? "KMGT"[k - 1] : "") + "b";
  const count = Math.floor(n / Math.pow(1024, k));
  return count + rank;
};

type UploadReturn<TImage> =
  | {
      error: "tooLarge";
      maxSize: number;
      readableMaxSize: string;
    }
  | {
      error: null;
      image: TImage;
    };

const imageSchema = z.object({
  bucket: z.string(),
  claimed: z.boolean(),
  filename: z.string(),
  hash: z.string(),
  id: z.string(),
  uploaded_at: z.number(),
  uploaded_by: z.string(),
});

export type UploadedImage = z.infer<typeof imageSchema>;
