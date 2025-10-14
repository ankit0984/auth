import { Router } from "express";

import { register } from "../controller/authController/register.controller.js";
import { login, refreshAccessToken } from "../controller/authController/login.controller.js";
import { logout } from "../controller/authController/logout.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { updateUser } from "../controller/authController/updateUser.controller.js";
import { requestPasswordReset } from "../controller/authController/resetPassword.controller.js";
import { changePassword } from "../controller/authController/forgotPassword.controller.js";

const auth_router = Router();

// Public routes
auth_router.route("/auth/register").post(register);
auth_router.route("/auth/login").post(login);
auth_router.route("/auth/forgot-password").post(requestPasswordReset);
auth_router.route("/auth/reset-password").post(changePassword);
// Protected routes
auth_router.route("/auth/logout").post(verifyJWT, logout);
auth_router.route("/updateUser/:userId").put(verifyJWT, updateUser);
auth_router.route("/refresh-token").post(verifyJWT, refreshAccessToken);
export { auth_router };
