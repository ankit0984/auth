import dbconfig from "../src/db/db.js";
import app from "../src/server/app.js";

let cachedDb=null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  cachedDb = await dbconfig()
  return cachedDb
}
export default async (req, res) => {
  await connectToDatabase();
  return app(req, res);
}