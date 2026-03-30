import jwt from "jsonwebtoken";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { User } from "../../models/users.models.js";
import { emailService } from "../../utils/emailService.js";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,64}$/;

export const changePassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, "token and new password are required");
  }

  if (!passwordRegex.test(newPassword)) {
    throw new ApiError(400, "password must be 8-64 chars and include uppercase, lowercase, number and special character");
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
  const user = await User.findOne({
    resetPasswordToken: decoded.resetToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, "invalid or expired reset token");
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.twoFactorVerification = { hash: null, expiresAt: null, sentAt: null };
  await user.save();

  try {
    await emailService.sendPasswordResetSuccessEmail(user);
  } catch (error) {
    console.error("Error sending password reset success email:", error);
  }

  return res.status(200).json(new ApiResponse(200, {}, "password reset successful"));
});
