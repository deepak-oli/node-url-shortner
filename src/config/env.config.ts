import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Load `.env` from root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(8000),

  JWT_SECRET: z.string().min(1),

  DB_USER: z.string().min(1),
  DB_HOST: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_PASS: z.string().min(1),
  DB_PORT: z.string().default("5432"),
  DATABASE_URL: z.string().url(),

  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().min(1),

  FRONTEND_URL: z.string().url(),
  BASE_URL: z.string().url(),

  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(1),
});

// Parse and validate
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

const isProduction = parsed.data.NODE_ENV === "production";

export const ENV = parsed.data;
export { isProduction };
