import dbconfig from "../db/db.js";

export const ensureDatabaseConnection = async (_req, res, next) => {
  try {
    await dbconfig();
    return next();
  } catch (error) {
    console.error("database unavailable for request", error);
    return res.status(503).json({
      success: false,
      statusCode: 503,
      message: "database unavailable",
    });
  }
};
