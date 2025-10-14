// request for password reset by sending mail for reset password
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { User } from "../../models/users.models.js";
import { emailService } from "../../utils/emailService.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Generate reset token
  const resetToken = uuidv4();
  const hashedToken = jwt.sign({ resetToken }, process.env.ACCESS_TOKEN, { expiresIn: "1h" });

  // Save token to user
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  try {
    // Send reset email using the new email service
    await emailService.sendPasswordResetEmail(user.email, hashedToken);

    res.status(200).json(new ApiResponse(200, {}, "Password reset email sent successfully"));
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    throw new ApiError(500, "Error sending password reset email");
  }
});
