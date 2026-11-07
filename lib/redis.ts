import { createClient } from "redis";

function makeClient(url: string) {
  return createClient({
    url,
    disableOfflineQueue: true,
    commandOptions: { timeout: 1500 },
    socket: { connectTimeout: 3000, reconnectStrategy: false },
  });
}

type Client = ReturnType<typeof makeClient>;
const globalRedis = globalThis as typeof globalThis & {
  voluntrRedis?: { client: Client | null; connecting: Promise<Client> | null };
};
const cached = globalRedis.voluntrRedis ??= { client: null, connecting: null };

export async function getRedis(): Promise<Client | null> {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (cached.client?.isReady) return cached.client;
  if (!cached.connecting) {
    cached.connecting = (async () => {
      const client = makeClient(url);
      // Avoid logging URLs or credentials from client error messages.
      client.on("error", () => console.error("Redis connection error"));
      try {
        await client.connect();
        cached.client = client;
        return client;
      } catch {
        if (client.isOpen) client.destroy();
        throw new Error("Redis unavailable");
      }
    })().finally(() => { cached.connecting = null; });
  }
  return cached.connecting;
}
