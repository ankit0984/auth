import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../../models/users.models.js";
import { emailService } from "../../utils/emailService.js";
import { generateRandomCode, getCodeExpiryDate, hashToken, normalizeIdentifier, publicUserProjection } from "../../utils/authSecurity.js";

export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { email, username, firstname, lastname } = req.body;

  if (!userId) {
    throw new ApiError(400, "user id is required");
  }

  const isSelf = req.user._id.toString() === userId;
  const isAdmin = req.user.role === "admin";

  if (!isSelf && !isAdmin) {
    throw new ApiError(403, "forbidden");
  }

  const updateData = {};
  let emailVerificationCode = null;

  if (email) {
    updateData.email = normalizeIdentifier(email);
    updateData.isEmailVerified = false;
    emailVerificationCode = generateRandomCode(6);
    updateData.emailVerification = {
      hash: hashToken(emailVerificationCode),
      expiresAt: getCodeExpiryDate(10),
      sentAt: new Date(),
    };
  }

  if (username) {
    updateData.username = normalizeIdentifier(username);
  }

  if (firstname) {
    updateData.firstname = firstname.toString().trim().toLowerCase();
  }

  if (lastname) {
    updateData.lastname = lastname.toString().trim().toLowerCase();
  }

  if (!Object.keys(updateData).length) {
    throw new ApiError(400, "at least one updatable field is required");
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select(publicUserProjection);

  if (!updatedUser) {
    throw new ApiError(404, "user not found");
  }

  if (emailVerificationCode) {
    try {
      await emailService.sendVerificationCodeEmail(updatedUser, emailVerificationCode);
    } catch (error) {
      console.error("Error sending verification email after email update:", error);
    }
  }

  return res.status(200).json(new ApiResponse(200, updatedUser, "user updated successfully"));
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!userId || !role) {
    throw new ApiError(400, "user id and role are required");
  }

  if (!["admin", "user"].includes(role)) {
    throw new ApiError(400, "invalid role");
  }

  const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true }).select(
    publicUserProjection
  );

  if (!updatedUser) {
    throw new ApiError(404, "user not found");
  }

  return res.status(200).json(new ApiResponse(200, updatedUser, "user role updated successfully"));
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({user}).select(publicUserProjection).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, users, "users fetched successfully"));
});
