import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../../models/users.models.js";
import {
  buildCookieOptions,
  generateRandomCode,
  getCodeExpiryDate,
  hashToken,
  normalizeIdentifier,
  publicUserProjection,
} from "../../utils/authSecurity.js";
import { emailService } from "../../utils/emailService.js";

const ACCESS_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

const generateAccessToken = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const accessToken = user.generateAccessToken();
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return accessToken;
};

const setAuthCookie = (res, accessToken) => res.cookie("accessToken", accessToken, buildCookieOptions(ACCESS_COOKIE_MAX_AGE));

const buildAuthContext = (user) => ({
  userId: user._id,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  twoFactorEnabled: user.twoFactorEnabled,
});

export const login = asyncHandler(async (req, res) => {
  const identifier = normalizeIdentifier(req.body.username || req.body.email);
  const password = req.body.password;

  if (!identifier || !password) {
    throw new ApiError(400, "username/email and password are required");
  }

  const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "invalid credentials");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "email verification required before login");
  }

  if (user.twoFactorEnabled) {
    const twoFactorCode = generateRandomCode(6);
    user.twoFactorVerification = {
      hash: hashToken(twoFactorCode),
      expiresAt: getCodeExpiryDate(10),
      sentAt: new Date(),
    };
    await user.save({ validateBeforeSave: false });
    await emailService.sendTwoFactorCodeEmail(user, twoFactorCode);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          userId: user._id,
          twoFactorRequired: true,
        },
        "2fa code sent to email"
      )
    );
  }

  const accessToken = await generateAccessToken(user._id);
  const safeUser = await User.findById(user._id).select(publicUserProjection);

  return setAuthCookie(res, accessToken)
    .status(200)
    .json(new ApiResponse(200, { user: safeUser, auth: buildAuthContext(safeUser), accessToken }, "login successful"));
});

export const verifyTwoFactorLogin = asyncHandler(async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    throw new ApiError(400, "userId and 2fa code are required");
  }

  const user = await User.findById(userId);
  if (!user || !user.twoFactorEnabled) {
    throw new ApiError(404, "2fa challenge not found");
  }

  const isCodeValid =
    user.twoFactorVerification?.hash &&
    user.twoFactorVerification?.expiresAt > new Date() &&
    user.twoFactorVerification.hash === hashToken(code.toString().trim().toUpperCase());

  if (!isCodeValid) {
    throw new ApiError(401, "invalid or expired 2fa code");
  }

  user.twoFactorVerification = { hash: null, expiresAt: null, sentAt: null };
  await user.save({ validateBeforeSave: false });

  const accessToken = await generateAccessToken(user._id);
  const safeUser = await User.findById(user._id).select(publicUserProjection);

  return setAuthCookie(res, accessToken)
    .status(200)
    .json(new ApiResponse(200, { user: safeUser, auth: buildAuthContext(safeUser), accessToken }, "login successful"));
});
