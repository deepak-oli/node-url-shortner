import { createClient, RedisClientType } from "redis";
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
}

// Export the client to be used in services
export function getRedisClient(): RedisClientType {
  if (!client) {
    throw new Error("Redis client not initialized");
  }
  return client;
}
