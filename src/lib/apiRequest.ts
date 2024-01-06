import { z, ZodSchema } from "zod";
import { api } from "./servers";

export const apiRequest = async (
  url: string,
  { auth = null, method = "GET", body }: APIRequest,
) => {
  const username = auth?.username;
  const token = auth?.token;
  const authHeaders: { username: string; token: string } | {} =
    username && token ? { username, token } : {};
  const response = await fetch(`${api}${url}`, {
    method,
    headers: {
      ...authHeaders,
      "content-type": "application/json",
    },
    body,
  });
  return {
    status: response.status,
    response: (await response.json()) as unknown,
  };
};
export const getResponseFromAPIRequest = async <TSchema extends ZodSchema>(
  url: string,
  { auth = null, method = "GET", body, schema }: APIRequestResponse<TSchema>,
): Promise<APIRequestResponseReturn<TSchema>> => {
  const { status, response } = await apiRequest(url, { auth, method, body });
  if (status !== 200) {
    return { status, response };
  }
  return schema.parse(response);
};

type APIRequest = {
  auth?: null | { username: string | null; token: string | null };
  method?: string;
  body?: string;
};
type APIRequestResponse<TSchema extends ZodSchema> = APIRequest & {
  schema: TSchema;
};
type APIRequestResponseReturn<TSchema extends ZodSchema> =
  | {
      status: number;
      response: unknown;
    }
  | z.infer<TSchema>;
