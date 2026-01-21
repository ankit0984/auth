import app from "./app.js";
import dbconfig from "../db/db.js";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

(async () => {
  try {
    await dbconfig();
    app.listen(process.env.SERVER_PORT || 3636, () => {
      console.log(`server is online on port => ${process.env.SERVER_PORT || 3636}`);
    });
  } catch (err) {
    console.log("database connection error", err);
    process.exit(1);
  }
})();
