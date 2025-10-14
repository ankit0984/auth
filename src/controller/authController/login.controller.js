import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../../models/users.models.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken(); // Ensure this method generates a valid JWT
    const refreshToken = user.generateRefreshToken(); // Ensure this method generates a valid JWT
    user.refreshToken = refreshToken; // Save refresh token to the user document
    await user.save({ validateBeforeSave: false }); // Save user with new refresh token

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

export const login = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email required");
  }
  if (!password) {
    throw new ApiError(400, "password required");
  }

  // find user by username or email
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  // check if password is correct
  // Validate the password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password");
  }

  // generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  // exclude sensitive fields from user object
  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken -resetPasswordToken -resetPasswordExpires"
  );

  // set cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, "login successful", loggedinUser));
});

// export const login = asyncHandler(async (req, res) => {
//   const { username, email, password } = req.body;

//   if (!username && !email) {
//     throw new ApiError(400, "username or email required");
//   }
//   if (!password) {
//     throw new ApiError(400, "password required");
//   }

//   // Find user by username or email
//   const user = await User.findOne({ $or: [{ username }, { email }] });
//   if (!user) {
//     throw new ApiError(404, "user does not exist");
//   }

//   // Validate password
//   const isPasswordValid = await user.isPasswordCorrect(password);
//   if (!isPasswordValid) {
//     throw new ApiError(401, "Invalid Password");
//   }

//   // Generate tokens
//   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

//   // Exclude sensitive fields
//   const loggedInUser = await User.findById(user._id).select(
//     "-password -refreshToken -resetPasswordToken -resetPasswordExpires"
//   );

//   // Cookie options
//   const cookieOptions = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV !== "development",
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     sameSite: "strict",
//   };

//   // Set cookies for accessToken, refreshToken, and userId
//   res
//     .status(200)
//     .cookie("accessToken", accessToken, cookieOptions)
//     .cookie("refreshToken", refreshToken, cookieOptions)
//     .cookie("userId", user._id.toString(), {
//       ...cookieOptions,
//       httpOnly: false, // Set to true if userId doesn't need to be accessed by frontend
//     })
//     .json(new ApiResponse(200, "login successful", loggedInUser));
// });

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN);

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access Token refreshed"));
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});
