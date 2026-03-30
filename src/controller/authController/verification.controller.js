import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../../models/users.models.js";
import { emailService } from "../../utils/emailService.js";
import { generateRandomCode, getCodeExpiryDate, hashToken, normalizeIdentifier, publicUserProjection } from "../../utils/authSecurity.js";

const assignEmailVerificationCode = async (user) => {
  const code = generateRandomCode(6);
  user.emailVerification = {
    hash: hashToken(code),
    expiresAt: getCodeExpiryDate(10),
    sentAt: new Date(),
  };
  await user.save({ validateBeforeSave: false });
  await emailService.sendVerificationCodeEmail(user, code);
};

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    throw new ApiError(400, "email and verification code are required");
  }

  const normalizedEmail = normalizeIdentifier(email);
  const normalizedCode = code.toString().trim().toUpperCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const isCodeValid =
    user.emailVerification?.hash &&
    user.emailVerification?.expiresAt > new Date() &&
    user.emailVerification.hash === hashToken(normalizedCode);

  if (!isCodeValid) {
    throw new ApiError(401, "invalid or expired verification code");
  }

  user.isEmailVerified = true;
  user.emailVerification = { hash: null, expiresAt: null, sentAt: null };
  await user.save({ validateBeforeSave: false });

  const safeUser = await User.findById(user._id).select(publicUserProjection);
  return res.status(200).json(new ApiResponse(200, { user: safeUser }, "email verified successfully"));
});

export const resendVerificationCode = asyncHandler(async (req, res) => {
  const identifier = normalizeIdentifier(req.body.email || req.body.username);

  if (!identifier) {
    throw new ApiError(400, "email or username is required");
  }

  const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "email already verified");
  }

  const lastSentAt = user.emailVerification?.sentAt ? new Date(user.emailVerification.sentAt).getTime() : 0;
  if (lastSentAt && Date.now() - lastSentAt < 60 * 1000) {
    throw new ApiError(429, "please wait before requesting another verification code");
  }

  await assignEmailVerificationCode(user);
  return res.status(200).json(new ApiResponse(200, {}, "verification code sent"));
});

export const enableTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "verify email before enabling 2fa");
  }

  if (user.twoFactorEnabled) {
    throw new ApiError(400, "2fa already enabled");
  }

  const code = generateRandomCode(6);
  user.twoFactorVerification = {
    hash: hashToken(code),
    expiresAt: getCodeExpiryDate(10),
    sentAt: new Date(),
  };
  await user.save({ validateBeforeSave: false });
  await emailService.sendTwoFactorCodeEmail(user, code);

  return res.status(200).json(new ApiResponse(200, {}, "2fa setup code sent"));
});

export const confirmEnableTwoFactor = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const user = await User.findById(req.user._id);

  if (!code) {
    throw new ApiError(400, "2fa code is required");
  }

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const isCodeValid =
    user.twoFactorVerification?.hash &&
    user.twoFactorVerification?.expiresAt > new Date() &&
    user.twoFactorVerification.hash === hashToken(code.toString().trim().toUpperCase());

  if (!isCodeValid) {
    throw new ApiError(401, "invalid or expired 2fa code");
  }

  user.twoFactorEnabled = true;
  user.twoFactorVerification = { hash: null, expiresAt: null, sentAt: null };
  await user.save({ validateBeforeSave: false });

  const safeUser = await User.findById(user._id).select(publicUserProjection);
  return res.status(200).json(new ApiResponse(200, { user: safeUser }, "2fa enabled successfully"));
});

export const disableTwoFactor = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id);

  if (!password) {
    throw new ApiError(400, "password is required");
  }

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "invalid password");
  }

  user.twoFactorEnabled = false;
  user.twoFactorVerification = { hash: null, expiresAt: null, sentAt: null };
  await user.save({ validateBeforeSave: false });

  const safeUser = await User.findById(user._id).select(publicUserProjection);
  return res.status(200).json(new ApiResponse(200, { user: safeUser }, "2fa disabled successfully"));
});
