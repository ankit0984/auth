import app from "./app.js";
import dbconfig from "../db/db.js";
import redisClient from "../db/redis.js";
import dotenv from "dotenv";

dotenv.config("../.env");
dbconfig()
  .then(() => {
    redisClient;
    app.listen(process.env.SERVER_PORT || 3636, () => {
      console.log(`server is online on port => ${process.env.SERVER_PORT}`);
    });
  })
  .catch((err) => {
    console.log("database connection error", err);
    process.exit(1);
  });
