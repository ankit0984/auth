// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import morgan from "morgan";
// import logger from "../db/logger.js";
// import compression from "compression";
// import ExpressMongoSanitize from "express-mongo-sanitize";
// import { limiter } from "../middleware/rateLimiter.js";
// import { ensureDatabaseConnection } from "../middleware/ensureDatabaseConnection.js";
// import dotenv from "dotenv";
//
// dotenv.config();
//
// const app = express();
// const configuredCorsOrigins = [
//   ...new Set(
//     [process.env.CORS_ORIGIN, process.env.FRONTEND_URL]
//       .flatMap((value) => value?.split(",") || [])
//       .map((origin) => origin.trim())
//       .filter(Boolean)
//   ),
// ];
//
// app.disable("x-powered-by");
//
// if (process.env.NODE_ENV === "production") {
//   app.set("trust proxy", 1);
// }
//
// app.use(helmet());
// app.use(
//   morgan("combined", {
//     stream: { write: (message) => logger.info(message.trim()) },
//   })
// );
// app.use(limiter);
// app.use(express.json({ limit: "36kb" }));
// app.use(express.urlencoded({ extended: true, limit: "36kb" }));
// app.use(cookieParser());
// app.use(compression());
// app.use(ExpressMongoSanitize());
//
// // cors
// const corsOptions = {
//   origin(origin, callback) {
//     if (!origin || configuredCorsOrigins.length === 0 || configuredCorsOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//
//     return callback(new Error(`origin ${origin} is not allowed by CORS`));
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "X-Access-Token",
//   ],
//   exposedHeaders: ["Content-Range", "X-Total-Count"],
// };
//
// app.use(cors(corsOptions));
//
// app.get("/", (_req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "API is working",
//   });
// });
//
// app.get("/api/health", (_req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "API is reachable",
//   });
// });
//
// app.use("/api", ensureDatabaseConnection);
//
// // routers for route
// import { auth_router } from "../routes/auth.routes.js";
// import { errorHandler } from "../middleware/errorHandelre.js";
// import { user_details } from "../routes/profile.routes.js";
// import { books_db_router } from "../routes/booksdb.routes.js";
//
// app.use("/api", auth_router);
// app.use("/api", user_details);
// app.use("/api", books_db_router);
// app.use(errorHandler);
//
// export default app;






import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import logger from "../db/logger.js";
import compression from "compression";
import ExpressMongoSanitize from "express-mongo-sanitize";
import { limiter } from "../middleware/rateLimiter.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);
app.use(limiter);
app.use(express.json({ limit: "36kb" }));
app.use(express.urlencoded({ extended: true, limit: "36kb" }));
app.use(cookieParser());
app.use(compression());
app.use(ExpressMongoSanitize());

// cors
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Range", "X-Total-Count"],
};

app.use(cors(corsOptions));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is reachable",
  });
});


// routers for route
import { auth_router } from "../routes/auth.routes.js";
import { errorHandler } from "../middleware/errorHandelre.js";
import { user_details } from "../routes/profile.routes.js";
import { books_db_router } from "../routes/booksdb.routes.js";

app.use("/api", auth_router);
app.use("/api", user_details);
app.use("/api", books_db_router);
app.use(errorHandler);

export default app;
