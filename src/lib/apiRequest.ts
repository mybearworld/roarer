import { z, ZodSchema } from "zod";
import { apiURL } from "./env";
import { useAuthStore } from "../stores/auth";

export const apiRequest = async (
  url: string,
  { auth = false, method = "GET", body }: APIRequest,
) => {
  const authStore = useAuthStore();

  const username = auth ? authStore.username : null;
  const token = auth ? authStore.token : null;
  const authHeaders: { username: string; token: string } | {} =
    username && token ? { username, token } : {};
  const response = await fetch(`${apiURL}${url}`, {
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
  { auth = false, method = "GET", body, schema }: APIRequestResponse<TSchema>,
): Promise<APIRequestResponseReturn<TSchema>> => {
  const { status, response } = await apiRequest(url, { auth, method, body });
  if (status !== 200) {
    return { status, response };
  }
  return schema.parse(response);
};

type APIRequest = {
  auth?: boolean;
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
