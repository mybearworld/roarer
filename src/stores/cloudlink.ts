import { ref } from "vue";
import { defineStore } from "pinia";
import { useI18n } from "vue-i18n";
import { ZodSchema, z } from "zod";
import CloudlinkClient, { CloudlinkPacket } from "@williamhorning/cloudlink";

export const useCloudlinkStore = defineStore("cloudlink", () => {
  const { t } = useI18n();

  const cloudlink = ref(
    new CloudlinkClient({
      url: import.meta.env.VITE_CLOUDLINK,
      log: false,
    }),
  );
  setInterval(() => {
    if (cloudlink.value.status === 1) {
      cloudlink.value.send({
        cmd: "ping",
        val: "",
      });
    }
    if (cloudlink.value.status === 3) {
      alert(t("disconnected"));
      location.reload();
    }
  }, 20000);
  cloudlink.value.on("packet", (packet: object) => {
    if (import.meta.env.DEV) {
      console.log("☁️", packet);
    }
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

  return { cloudlink, send, lookFor };
});
