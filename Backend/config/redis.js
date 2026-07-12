import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:4000";

const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null // Required by BullMQ
});

redisConnection.on("connect", () => {
  console.log("Connected to Redis server");
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redisConnection;
