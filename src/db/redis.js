import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));

// Start connecting but do not await at module import time — this prevents build-time blocking
redisClient.connect().catch((err) => {
  // Log connection errors but do not throw during build
  console.warn("Redis connection failed (non-fatal at import time):", err?.message || err);
});

export default redisClient;
