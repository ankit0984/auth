import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { BookSchema } from "../../../models/books.models.js";

export const countBook = asyncHandler(async (req, res) => {
  const count = await BookSchema.countDocuments();
  const progBooks = await BookSchema.aggregate([
    {
      $group: {
        _id: "$genre",
        count: { $sum: 1 }
      }
    }
  ]);
  return res.status(200).json(new ApiResponse(200, { count, progBooks }, "book count fetched successfully"));
})