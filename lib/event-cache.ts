import { createHash, randomUUID } from "node:crypto";
import { getRedis } from "@/lib/redis";

const VERSION_KEY = "voluntr:event-search:v1:version";
const TTL_SECONDS = 15;
const PARAMETERS = ["q", "location", "category", "scope", "from", "to", "available", "sort", "page"];

export async function readEventCache(params: URLSearchParams): Promise<{ key: string | null; value: unknown | null }> {
  try {
    const redis = await getRedis();
    if (!redis) return { key: null, value: null };
    const version = await redis.get(VERSION_KEY) || "initial";
    const query = PARAMETERS.map((name) => [name, (params.get(name) || "").trim()]);
    const digest = createHash("sha256").update(JSON.stringify(query)).digest("hex");
    const key = `voluntr:event-search:v1:${version}:${digest}`;
    const data = await redis.get(key);
    return { key, value: data ? JSON.parse(data) : null };
  } catch {
    console.warn("Event search cache unavailable; using MongoDB");
    return { key: null, value: null };
  }
}

export async function writeEventCache(key: string | null, value: unknown) {
  if (!key) return;
  try {
    const redis = await getRedis();
    await redis?.set(key, JSON.stringify(value), { EX: TTL_SECONDS });
  } catch { console.warn("Could not cache event search results"); }
}

export async function invalidateEventCache() {
  try {
    const redis = await getRedis();
    // A new generation prevents in-flight reads from repopulating the active cache
    // with an old database snapshot. Old generations expire without scanning keys.
    await redis?.set(VERSION_KEY, randomUUID());
  } catch { console.warn("Could not invalidate event search cache; entries expire within 15 seconds"); }
}
