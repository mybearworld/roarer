import { z, ZodSchema } from "zod";
import { useLoginStatusStore } from "../stores/loginStatus";

export const apiRequest = async (
  url: string,
  { auth = false, method = "GET", body }: APIRequest,
) => {
  const loginStatusStore = useLoginStatusStore();

  const username = auth ? loginStatusStore.username : null;
  const token = auth ? loginStatusStore.token : null;
  const authHeaders: { username: string; token: string } | {} =
    username && token ? { username, token } : {};
  const response = await fetch(`${import.meta.env.VITE_API}${url}`, {
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
