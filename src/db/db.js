import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectionCache = globalThis.__mongooseConnectionCache ?? {
  connection: null,
  promise: null,
};

globalThis.__mongooseConnectionCache = connectionCache;

const dbconfig = async () => {
  if (connectionCache.connection) {
    return connectionCache.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined, please check your .env file");
  }

  try {
    if (!connectionCache.promise) {
      connectionCache.promise = mongoose
        .connect(process.env.MONGO_URI, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        })
        .then((mongooseInstance) => {
          console.log("Connected to MongoDB");
          return mongooseInstance;
        });
    }

    connectionCache.connection = await connectionCache.promise;
    return connectionCache.connection;
  } catch (error) {
    connectionCache.promise = null;
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

export default dbconfig;
