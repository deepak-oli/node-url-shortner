import { SetOptions } from "redis";

import { getRedisClient } from "@/config/redis.config";

export async function redisSet(
  key: string,
  value: string,
  options?: SetOptions
): Promise<void> {
  const client = getRedisClient();
  await client.set(key, value, options);
}

export async function redisGet(key: string): Promise<string | null> {
  const client = getRedisClient();
  return await client.get(key);
}

export async function redisDel(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}
