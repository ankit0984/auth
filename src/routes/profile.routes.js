import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { user_profile } from "../controller/userProfile/profile.controller.js";


const user_details=Router();

user_details.route("/user/details").get(verifyJWT, user_profile)
export {user_details};