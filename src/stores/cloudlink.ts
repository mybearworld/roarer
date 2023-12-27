import { defineStore } from "pinia";
import { ZodSchema, z } from "zod";
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
    send<TSchema extends ZodSchema>(
      packet: CloudlinkPacket,
      responseSchema: TSchema,
    ) {
      return new Promise<z.infer<TSchema>>((resolve, reject) => {
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
          val: z.string().startsWith("E:"),
        });
        let stop = false;
        setTimeout(() => {
          stop = true;
          reject("Timeout");
        }, 1500);
        this.cloudlink.on("packet", (packet: unknown) => {
          if (stop) {
            return;
          }
          const safePacket = schema.safeParse(packet);
          console.log(safePacket);
          if (!safePacket.success) {
            const safeErrorPacket = errorSchema.safeParse(packet);
            if (!safeErrorPacket.success) {
              return;
            }
            reject(safeErrorPacket.data.val);
            stop = true;
            return;
          }
          resolve(safePacket.data.val);
          stop = true;
        });
      });
    },
    lookFor<TSchema extends ZodSchema>(
      schema: TSchema,
      fun: (packet: z.infer<TSchema>) => void,
      shouldStop = true,
    ) {
      let stop = false;
      this.cloudlink.on("packet", (packet: unknown) => {
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
    },
  },
});
