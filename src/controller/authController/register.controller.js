import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { emailService } from "../../utils/emailService.js";
import { User } from "../../models/users.models.js";
import {
  generateRandomCode,
  getCodeExpiryDate,
  hashToken,
  normalizeIdentifier,
  publicUserProjection,
} from "../../utils/authSecurity.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,64}$/;

export const register = asyncHandler(async (req, res) => {
  const { username, firstname, lastname, email, password } = req.body;

  if (!username || !firstname || !lastname || !email || !password) {
    throw new ApiError(400, "all fields are required");
  }

  const normalizedUsername = normalizeIdentifier(username);
  const normalizedEmail = normalizeIdentifier(email);
  const normalizedFirstname = firstname.trim().toLowerCase();
  const normalizedLastname = lastname.trim().toLowerCase();

  if (!emailRegex.test(normalizedEmail)) {
    throw new ApiError(400, "invalid email");
  }

  if (!passwordRegex.test(password)) {
    throw new ApiError(400, "password must be 8-64 chars and include uppercase, lowercase, number and special character");
  }

  if (password.toLowerCase().includes(normalizedUsername) || password.toLowerCase().includes(normalizedEmail)) {
    throw new ApiError(400, "password should not contain username or email");
  }

  const existingUser = await User.findOne({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] });
  if (existingUser) {
    throw new ApiError(409, "user already exists");
  }

  const verificationCode = generateRandomCode(6);
  const createdUser = await User.create({
    username: normalizedUsername,
    firstname: normalizedFirstname,
    lastname: normalizedLastname,
    email: normalizedEmail,
    password,
    role: "user",
    emailVerification: {
      hash: hashToken(verificationCode),
      expiresAt: getCodeExpiryDate(10),
      sentAt: new Date(),
    },
  });

  const user = await User.findById(createdUser._id).select(publicUserProjection);

  try {
    await emailService.sendVerificationCodeEmail(createdUser, verificationCode);
  } catch (error) {
    throw new ApiError(
      502,
      "account created but verification email could not be sent, please request a new code from resend verification"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        verificationRequired: true,
      },
      "user created successfully, verification code sent to email"
    )
  );
});
