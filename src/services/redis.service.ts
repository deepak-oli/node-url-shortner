import { createClient, RedisClientType, SetOptions } from "redis";
import { ENV } from "@/config/env.config";

let client: RedisClientType;

export async function initRedis(): Promise<void> {
  client = createClient({
    socket: {
      host: ENV.REDIS_HOST,
      port: ENV.REDIS_PORT,
    },
    password: ENV.REDIS_PASSWORD,
  });

  client.on("error", (err) => console.error("Redis error:", err));

  await client.connect();
  console.log("Redis connected");
}

export async function redisSet(
  key: string,
  value: string,
  options?: SetOptions
): Promise<void> {
  await client.set(key, value, options);
}

export async function redisGet(key: string): Promise<string | null> {
  return await client.get(key);
}

export async function redisDel(key: string): Promise<void> {
  await client.del(key);
}
