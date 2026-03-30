import { BookSchema } from "../../../models/books.models.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { normalizeAuthors } from "../../../utils/normalizeAuthors.js";

export const uploadBookMock = asyncHandler(async (req, res) => {
  const { title, author, description, genre, language, coverImage, coverImageFileId, pdf, pdfFileId } = req.body;

  if (
    !title ||
    !author ||
    !description ||
    !genre ||
    !language ||
    !coverImage ||
    !coverImageFileId ||
    !pdf ||
    !pdfFileId
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedTitle = title.trim().toLowerCase();
  const normalizedAuthors = normalizeAuthors(author);

  if (!normalizedAuthors.length) {
    throw new ApiError(400, "author must contain at least one valid author name");
  }

  const existingBook = await BookSchema.findOne({
    title: normalizedTitle,
    author: normalizedAuthors,
  });

  if (existingBook) {
    throw new ApiError(409, "Book already exists");
  }

  const book = await BookSchema.create({
    title: normalizedTitle,
    author: normalizedAuthors,
    description: description.trim(),
    genre: genre.trim().toLowerCase(),
    language: language.trim().toLowerCase(),

    // 🔥 now dynamic
    coverImage,
    coverImageFileId,
    pdf,
    pdfFileId,
  });

  return res.status(201).json(new ApiResponse(201, { book }, "Mock book inserted"));
});
