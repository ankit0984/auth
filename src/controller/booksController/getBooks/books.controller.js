import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { BookSchema } from "../../../models/books.models.js";

export const getBooks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.page_size);

  if (page < 1 || limit < 1) {
    throw new ApiError(400, "Invalid page or page size");
  }

  const skip = (page - 1) * limit;

  const books = await BookSchema.find().sort({ _id: -1 }).skip(skip).limit(limit);

  const totalBooks = await BookSchema.countDocuments();

  const hasNext = page * limit < totalBooks;
  const hasPrev = page > 1;

  if (!books || books.length === 0) {
    throw new ApiError(404, "No books found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        books,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(totalBooks / limit),
        totalBooks,
        hasNext,
        hasPrev,
      },
      "Books fetched successfully"
    )
  );
});