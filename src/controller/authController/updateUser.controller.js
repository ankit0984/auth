import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../../models/users.models.js";

export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { email, username } = req.body;

  // Ensure that userId is provided
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Check if email or password is provided
  if (!email && !username) {
    throw new ApiError(400, "At least one field (email or password) is required");
  }

  const updateData = {};
  if (email) {
    updateData.email = email;
  }
  if (username) {
    updateData.username = username;
  }

  // Find the user by ID and update the email and/or password
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true, // Return the updated document
    runValidators: true, // Validate before saving
  }).select("-password -refreshToken -resetPasswordToken -resetPasswordExpires"); // Exclude sensitive fields from the response

  // If user not found, throw an error
  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  // Respond with the updated user data
  return res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));
});
