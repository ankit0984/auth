import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../../models/users.models.js";
import jwt from "jsonwebtoken";


const user_profile = asyncHandler(async (req, res) => {

    try {
        let user;
        if (req.user) {
            user = req.user;
        } else {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
            if (!token) {
                throw new ApiError(401, "Unauthorized request");
            }
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);
            user = await User.findById(decodedToken?._id)
        }
        if (!user) {
            throw new ApiError(
                404,
                "user not exists",
                [
                    {
                        message: "invalid user or token",
                    },
                ]
            );
        }
        return res.json(new ApiResponse(200, user, "user found"))
    } catch (error) {
        throw new ApiError(500, [{ field: error.message, message: `operaion not perform ${error.message}` }])
    }

})
export { user_profile }