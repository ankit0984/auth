import { BookSchema } from "../../../models/books.models.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

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
  const normalizeAuthors = (authorInput) => {
    if (Array.isArray(authorInput)) {
      return authorInput.map((author) => author?.toString().trim().toLowerCase()).filter(Boolean);
    }

    if (typeof authorInput === "string") {
      const trimmed = authorInput.trim();

      if (!trimmed) {
        return [];
      }

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((author) => author?.toString().trim().toLowerCase()).filter(Boolean);
        }
      } catch {
        return trimmed
          .split(",")
          .map((author) => author.trim().toLowerCase())
          .filter(Boolean);
      }

      return [trimmed.toLowerCase()];
    }

    return [];
  };

  const existingBook = await BookSchema.findOne({
    title: normalizedTitle,
    author: normalizeAuthors,
  });

  if (existingBook) {
    throw new ApiError(409, "Book already exists");
  }

  const book = await BookSchema.create({
    title: normalizedTitle,
    author: normalizeAuthors,
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
