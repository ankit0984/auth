import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const user_profile = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "user found"));
});

export { user_profile };
