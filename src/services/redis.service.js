import redisClient from "../db/redis.js";

const CACHE_DURATION = 3600; // 1 hour in seconds

export const redisService = {
  async getCache(key) {
    try {
      const cachedData = await redisClient.get(key);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error("Redis get cache error:", error);
      return null;
    }
  },

  async setCache(key, data, duration = CACHE_DURATION) {
    try {
      await redisClient.setEx(key, duration, JSON.stringify(data));
    } catch (error) {
      console.error("Redis set cache error:", error);
    }
  },

  async deleteCache(key) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error("Redis delete cache error:", error);
    }
  },

  // Cache game by ID
  async cacheGame(gameId, gameData) {
    await this.setCache(`game:${gameId}`, gameData);
  },

  // Get cached game by ID
  async getCachedGame(gameId) {
    return await this.getCache(`game:${gameId}`);
  },

  // Cache game list with pagination
  async cacheGameList(page, limit, games) {
    await this.setCache(`games:${page}:${limit}`, games);
  },

  // Get cached game list
  async getCachedGameList(page, limit) {
    return await this.getCache(`games:${page}:${limit}`);
  }
};

export default redisService;
