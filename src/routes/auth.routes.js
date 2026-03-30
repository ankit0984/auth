import { Router } from "express";
import { register } from "../controller/authController/register.controller.js";
import { login, verifyTwoFactorLogin } from "../controller/authController/login.controller.js";
import { logout } from "../controller/authController/logout.controller.js";
import { verifyJWT, requireRole, requireVerifiedEmail } from "../middleware/auth.middleware.js";
import { listUsers, updateUser, updateUserRole } from "../controller/authController/updateUser.controller.js";
import { requestPasswordReset } from "../controller/authController/resetPassword.controller.js";
import { changePassword } from "../controller/authController/forgotPassword.controller.js";
import {
  confirmEnableTwoFactor,
  disableTwoFactor,
  enableTwoFactor,
  resendVerificationCode,
  verifyEmail,
} from "../controller/authController/verification.controller.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { admin_user_profile, user_profile } from "../controller/userProfile/profile.controller.js";

const auth_router = Router();
auth_router.use("/auth", authLimiter);

auth_router.route("/auth/register").post(register);
auth_router.route("/auth/login").post(login);
auth_router.route("/auth/login/2fa").post(verifyTwoFactorLogin);
auth_router.route("/auth/verify-email").post(verifyEmail);
auth_router.route("/auth/resend-verification").post(resendVerificationCode);
auth_router.route("/auth/forgot-password").post(requestPasswordReset);
auth_router.route("/auth/reset-password").post(changePassword);
auth_router.route("/auth/logout").post(verifyJWT, logout);

auth_router.route("/auth/2fa/enable").post(verifyJWT, requireVerifiedEmail, enableTwoFactor);
auth_router.route("/auth/2fa/confirm").post(verifyJWT, requireVerifiedEmail, confirmEnableTwoFactor);
auth_router.route("/auth/2fa/disable").post(verifyJWT, requireVerifiedEmail, disableTwoFactor);

auth_router.route("/users/:userId").put(verifyJWT, updateUser);
auth_router.route("/users/admin/profile").get(verifyJWT,requireRole("admin"), admin_user_profile);
auth_router.route("/users/profile").get(verifyJWT,requireRole("user"), user_profile);

auth_router.route("/admin/users").get(verifyJWT, requireRole("admin"), listUsers);
auth_router.route("/admin/users/:userId/role").patch(verifyJWT, requireRole("admin"), updateUserRole);

export { auth_router };
