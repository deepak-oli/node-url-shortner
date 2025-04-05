import { createClient, RedisClientType, SetOptions } from "redis";

let client: RedisClientType;

export async function initRedis(): Promise<void> {
  client = createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
    password: process.env.REDIS_PASSWORD,
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
