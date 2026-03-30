import jwt from "jsonwebtoken";
import { User } from "../models/users.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { extractAccessToken, publicUserProjection } from "../utils/authSecurity.js";

export const verifyJWT = asyncHandler(async (req, _res, next) => {
  try {
    const token = extractAccessToken(req);

    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);
    const user = await User.findById(decodedToken?._id).select(publicUserProjection);

    if (!user) {
      throw new ApiError(401, "invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid token");
  }
});

export const requireVerifiedEmail = (req, _res, next) => {
  if (!req.user?.isEmailVerified) {
    throw new ApiError(403, "verified email required");
  }

  next();
};

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, "forbidden");
  }


  next();
};
