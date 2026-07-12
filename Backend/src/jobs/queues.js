import redisConnection from "../../config/redis.js";
import { compileAndCacheStats } from "./analyticsHelper.js";

export const refreshCache = async () => {
  try {
    // 1. Delete the cached stats in Redis
    await redisConnection.del("dashboard_stats");

    // 2. Refresh cache asynchronously (in-process)
    compileAndCacheStats().catch((err) => {
      console.error("Async cache compilation failed:", err);
    });
  } catch (err) {
    console.error("Cache refresh trigger failed:", err);
  }
};
