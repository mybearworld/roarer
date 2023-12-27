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
export const useCloudlinkStore = defineStore("cloudlink", {
  state: () => ({
    cloudlink: client,
  }),
  actions: {
    setup() {
      if (this.cloudlink.status === 1) {
        return new Promise<void>((resolve) => resolve());
      }
      return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (this.cloudlink.status === 1) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    },
    async send(packet: CloudlinkPacket) {
      await this.setup();
      this.cloudlink.send(packet);
    },
    login(username: string, password: string) {
      this.send({
        cmd: "direct",
        val: {
          cmd: "authpswd",
          val: { username, pswd: password },
        },
      });
    },
    lookFor<TSchema extends ZodSchema>(
      schema: TSchema,
      fun: (packet: z.infer<TSchema>) => void,
    ) {
      let stop = false;
      this.cloudlink.on("packet", (packet: unknown) => {
        if (stop) {
          return;
        }
        const parsed = schema.safeParse(packet);
        if (!parsed.success) {
          return;
        }
        fun(parsed.data);
      });
    },
  },
});
