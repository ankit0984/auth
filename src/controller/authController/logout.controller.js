import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../../models/users.models.js";
import { clearCookieOptions } from "../../utils/authSecurity.js";

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        twoFactorVerification: { hash: null, expiresAt: null, sentAt: null },
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", clearCookieOptions)
    .json(new ApiResponse(200, {}, "user logout"));
});

export { logout };
