// src/common/redis/redis.client.ts
import { createClient, RedisClientType } from "redis";
import { env } from "../../../../app/config/env";
import logger from "../../../../app/utils/logger";

export class RedisClient {
    private static instance: RedisClient;
    private client: RedisClientType;

    private constructor() {
        this.client = createClient({
            socket: {
                host: env.REDIS_HOST,
                port: Number(env.REDIS_PORT),
            },
            password: env.REDIS_PASSWORD,
        });

        this.client.on("connect", () => {
            logger.info("✅ Redis connected");
        });

        this.client.on("error", (err) => {
            logger.error("❌ Redis error", err);
        });

        this.client.on("reconnecting", () => {
            logger.warn("🔄 Redis reconnecting...");
        });

        this.client.connect().catch((err) => {
            logger.error("❌ Failed to connect to Redis", err);
        });
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    // ---------- BASIC OPERATIONS ----------

    async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
        try {
            const data = JSON.stringify(value);

            if (ttlSeconds) {
                await this.client.set(key, data, { EX: ttlSeconds });
            } else {
                await this.client.set(key, data);
            }

            logger.debug(`Redis SET key=${key}`);
        } catch (err) {
            logger.error(`Redis SET failed for key=${key}`, err);
            throw err;
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await this.client.get(key);

            logger.debug(`Redis GET key=${key}`);
            return data ? (JSON.parse(data) as T) : null;
        } catch (err) {
            logger.error(`Redis GET failed for key=${key}`, err);
            throw err;
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.client.del(key);
            logger.debug(`Redis DEL key=${key}`);
        } catch (err) {
            logger.error(`Redis DEL failed for key=${key}`, err);
            throw err;
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const exists = (await this.client.exists(key)) === 1;
            logger.debug(`Redis EXISTS key=${key} -> ${exists}`);
            return exists;
        } catch (err) {
            logger.error(`Redis EXISTS failed for key=${key}`, err);
            throw err;
        }
    }

    async ping(): Promise<boolean> {
        try {
            await this.client.ping();
            return true;
        } catch {
            return false;
        }
    }


    async disconnect(): Promise<void> {
        try {
            await this.client.quit();
            logger.info("🛑 Redis disconnected");
        } catch (err) {
            logger.error("❌ Redis disconnect failed", err);
        }
    }
}
