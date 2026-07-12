import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  retryStrategy(times) {
    if (times > 5) {
      console.warn("Redis reconnect attempts exceeded. Caching will be disabled.");
      return null;
    }
    return Math.min(times * 100, 3000);
  }
});

redisConnection.on("connect", () => {
  console.log("Connected to Redis server");
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redisConnection;
