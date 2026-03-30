import { BookSchema } from "../../../models/books.models.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
//
// export const getBooksv2 = asyncHandler(async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = 10;
//
//   const skip = (page - 1) * limit;
//
//   const books = await BookSchema.find()
//     .skip(skip)
//     .limit(limit + 1); // 👈 extra record to check next
//
//   let hasNext = false;
//
//   if (books.length > limit) {
//     hasNext = true;
//     // books.pop(); // remove extra item
//   }
//
//   const hasPrev = page > 1;
//
//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         books,
//         page,
//         hasNext,
//         hasPrev,
//       },
//       "Books fetched successfully"
//     )
//   );
// });

// cursor based pagination
export const getBooksv2 = asyncHandler(async (req, res) => {
  const limit = 10;
  const { cursor } = req.query;

  const filter = {};

  if (cursor) {
    filter._id = { $lt: cursor }; // 👈 fetch older data
  }

  const books = await BookSchema.find(filter)
    .sort({ _id: -1 }) // latest first
    .limit(limit + 1);

  if (books.length === 0) {
return res.status(404).json(new ApiError(404, "No books found",))
  }

  let nextCursor = null;
  let hasNext = false;

  if (books.length > limit) {
    hasNext = true;
    const lastItem = books.pop();
    nextCursor = lastItem._id;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        books,
        nextCursor,
        hasNext,
      },
      "Books fetched successfully"
    )
  );
});