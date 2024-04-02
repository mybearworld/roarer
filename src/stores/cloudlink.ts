import { ref } from "vue";
import { defineStore } from "pinia";
import { useI18n } from "vue-i18n";
import { ZodSchema, z } from "zod";
import CloudlinkClient, { CloudlinkPacket } from "@williamhorning/cloudlink";
import { relationshipPacketSchema } from "../lib/schemas/relationship";
import { cloudlinkURL } from "../lib/env";
import { loginSchema } from "../lib/loginSchema";
import { useDialogStore } from "./dialog";
import { useAuthStore } from "./auth";
import { useRelationshipStore } from "./relationship";

export const useCloudlinkStore = defineStore("cloudlink", () => {
  const { t } = useI18n();
  const dialogStore = useDialogStore();
  const authStore = useAuthStore();
  const relationshipStore = useRelationshipStore();

  const cloudlink = ref(
    new CloudlinkClient({
      url: cloudlinkURL,
      log: false,
    }),
  );
  setInterval(async () => {
    if (cloudlink.value.status === 1) {
      cloudlink.value.send({
        cmd: "ping",
        val: "",
      });
    }
  }, 20000);
  cloudlink.value.on("packet", (packet: object) => {
    if (import.meta.env.DEV) {
      console.log("☁️", packet);
    }
  });

  cloudlink.value.on("close", async () => {
    cloudlink.value.connect();
    dialogStore.alert(t("disconnectedDialog"), false);
    await waitUntilSendable();
    dialogStore.closeAlert();
  });

  const waitUntilSendable = () => {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (cloudlink.value.status === 1) {
          clearInterval(interval);
          resolve();
        }
      });
    });
  };

  const send = <TSchema extends ZodSchema>(
    packet: CloudlinkPacket,
    responseSchema: TSchema,
    direct = true,
  ) => {
    return new Promise<z.infer<TSchema>>(async (resolve, reject) => {
      await waitUntilSendable();
      cloudlink.value.send({
        cmd: "direct",
        val: packet,
      });
      const schema = direct
        ? z.object({
            cmd: z.literal("direct"),
            val: responseSchema,
          })
        : responseSchema;
      const errorSchema = z.object({
        cmd: z.literal("statuscode"),
        val: z
          .string()
          .startsWith("E:")
          .or(
            z.string().startsWith("I:011").or(z.string().startsWith("I:017")),
          ),
      });
      setTimeout(() => {
        reject("Timeout");
      }, 2500);
      lookFor(schema, (packet) => resolve(packet.val), true);
      lookFor(errorSchema, (packet) => reject(packet.val), true);
    });
  };

  const lookFor = <TSchema extends ZodSchema>(
    schema: TSchema,
    fun: (packet: z.infer<TSchema>) => void,
    shouldStop = true,
  ) => {
    let stop = false;
    cloudlink.value.on("packet", (packet: unknown) => {
      if (stop && shouldStop) {
        return;
      }
      const parsed = schema.safeParse(packet);
      if (!parsed.success) {
        return;
      }
      stop = true;
      fun(parsed.data);
    });
  };

  const login = async (username: string, password: string) => {
    const response = await send(
      {
        cmd: "authpswd",
        val: { username: username, pswd: password },
      },
      loginSchema,
    );
    relationshipStore.blockedUsers = new Set(
      response.payload.relationships
        .filter((relationship) => relationship.state === 2)
        .map((relationship) => relationship.username),
    );
    authStore.username = response.payload.username;
    authStore.token = response.payload.token;
    authStore.isLoggedIn = true;
    return response;
  };

  if (authStore.username !== null && authStore.token !== null) {
    let nonNullCredentials: [string, string] = [
      authStore.username,
      authStore.token,
    ];

    const syntaxErrorSchema = z.object({
      val: z.literal("E:101 | Syntax"),
    });
    cloudlink.value.on("statuscode", async (packet: unknown) => {
      if (authStore.isLoggedIn) {
        return;
      }
      if (syntaxErrorSchema.safeParse(packet).success) {
        try {
          await login(...nonNullCredentials);
        } catch (e) {
          if (!(await dialogStore.confirm(t("loginFail")))) {
            authStore.username = null;
            authStore.token = null;
          }
          location.reload();
        }
      }
    });
  }

  lookFor(
    relationshipPacketSchema,
    (packet) => {
      if (packet.val.payload.state === 0) {
        relationshipStore.blockedUsers.delete(packet.val.payload.username);
        relationshipStore.blockedUsers = relationshipStore.blockedUsers;
      } else {
        relationshipStore.blockedUsers.add(packet.val.payload.username);
        relationshipStore.blockedUsers = relationshipStore.blockedUsers;
      }
    },
    false,
  );

  return { cloudlink, send, lookFor, login };
});
