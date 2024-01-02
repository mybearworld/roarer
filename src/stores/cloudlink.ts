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
  if (client.status === 1) {
    client.send({
      cmd: "ping",
      val: "",
    });
  }
  if (client.status === 3) {
    alert("You were disconnected. Clicking OK will reload the page.");
    location.reload();
  }
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
        }, 2500);
        this.lookFor(schema, (packet) => resolve(packet.val), true);
        this.lookFor(errorSchema, (packet) => reject(packet.val), true);
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
