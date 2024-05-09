import { z } from "zod";
import { getResponseFromAPIRequest } from "./api/request";

export const upload = async (
  file: File,
): Promise<UploadReturn<UploadedImage>> => {
  const token = await getResponseFromAPIRequest("/uploads/token/icon", {
    auth: true,
    schema: tokenSchema,
  });
  if (token.error !== null) {
    return { error: "tokenFail", status: token.error };
  }
  if (file.size > token.data.max_size) {
    return {
      error: "tooLarge",
      maxSize: token.data.max_size,
      readableMaxSize: shortenBytes(token.data.max_size),
    };
  }
  const form = new FormData();
  form.set("file", file);
  const image = imageSchema.parse(
    await (
      await fetch("https://uploads.meower.org/icons", {
        method: "POST",
        body: form,
        headers: {
          Authorization: token.data.token,
        },
      })
    ).json(),
  );
  return { error: null, image };
};

const MEO_MAX_SIZE = 32 * 1024 * 1024;
export const uploadToMeo = async (
  file: File,
): Promise<UploadReturn<UploadedMeoImage>> => {
  if (file.size > MEO_MAX_SIZE) {
    return {
      error: "tooLarge",
      maxSize: MEO_MAX_SIZE,
      readableMaxSize: shortenBytes(MEO_MAX_SIZE),
    };
  }
  const form = new FormData();
  form.set("username", "roarer");
  form.set("image", file);
  const image = meoImageSchema.parse(
    await (
      await fetch("https://meouploads.schafezr0000.workers.dev", {
        method: "POST",
        body: form,
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
      error: "tokenFail";
      status: number;
    }
  | {
      error: "tooLarge";
      maxSize: number;
      readableMaxSize: string;
    }
  | {
      error: null;
      image: TImage;
    };

const tokenSchema = z.object({
  expires: z.number(),
  id: z.string(),
  max_size: z.number(),
  token: z.string(),
});

const imageSchema = z.object({
  id: z.string(),
  hash: z.string(),
  mime: z.string(),
  size: z.number(),
  width: z.number(),
  height: z.number(),
  uploaded_by: z.string(),
  uploaded_at: z.number(),
});

export type UploadedImage = z.infer<typeof imageSchema>;

const meoImageSchema = z.object({
  data: z.object({
    display_url: z.string(),
  }),
});

export type UploadedMeoImage = z.infer<typeof meoImageSchema>;
