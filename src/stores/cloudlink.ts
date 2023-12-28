import { defineStore } from "pinia";
import { ZodSchema, late, z } from "zod";
import CloudlinkClient, { CloudlinkPacket } from "@williamhorning/cloudlink";

const client = new CloudlinkClient({
  url: "wss://api.meower.org/v0/cloudlink",
  log: import.meta.env.DEV,
});
const interval = setInterval(() => {
  if (client.status === 1) {
    clearInterval(interval);
    client.send({ cmd: "direct", val: "meower" });
  }
});
setInterval(() => {
  client.send({
    cmd: "ping",
    val: "",
  });
}, 10000);

export const useCloudlinkStore = defineStore("cloudlink", {
  state: () => ({
    cloudlink: client,
  }),
  actions: {
    waitUntilSendable() {
      return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (this.cloudlink.status === 1) {
            clearInterval(interval);
            resolve();
          }
        });
      });
    },
    send<TSchema extends ZodSchema>(
      packet: CloudlinkPacket,
      responseSchema: TSchema,
      log = false,
    ) {
      return new Promise<z.infer<TSchema>>(async (resolve, reject) => {
        await this.waitUntilSendable();
        this.cloudlink.send({
          cmd: "direct",
          val: packet,
        });
        const schema = z.object({
          cmd: z.literal("direct"),
          val: responseSchema,
        });
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
        }, 1500);
        this.lookFor(schema, (packet) => resolve(packet.val), true, log);
        this.lookFor(errorSchema, (packet) => reject(packet.val), true, log);
      });
    },
    lookFor<TSchema extends ZodSchema>(
      schema: TSchema,
      fun: (packet: z.infer<TSchema>) => void,
      shouldStop = true,
      log = false,
    ) {
      let stop = false;
      this.cloudlink.on("packet", (packet: unknown) => {
        if (log) console.log("recieved", { packet });
        if (stop && shouldStop) {
          return;
        }
        if (log) console.log(schema);
        const parsed = schema.safeParse(packet);
        if (log) console.log({ parsed, packet });
        if (!parsed.success) {
          return;
        }
        stop = true;
        fun(parsed.data);
      });
    },
  },
});
