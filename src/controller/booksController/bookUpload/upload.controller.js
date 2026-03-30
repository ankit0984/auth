import path from "path";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { BookSchema } from "../../../models/books.models.js";
import { buildBookUploadMeta, uploadBufferToImageKit } from "../../../utils/imagekitUpload.js";
import { normalizeAuthors } from "../../../utils/normalizeAuthors.js";

const IMAGEKIT_MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export const uploadBook = asyncHandler(async (req, res) => {
  const { title, author, description, genre, language } = req.body;
  const coverImageFile = req.files?.coverImage?.[0];
  const pdfFile = req.files?.pdf?.[0];

  if (!title || !author || !description || !genre || !language || !coverImageFile || !pdfFile) {
    throw new ApiError(400, "title, author, description, genre, language, coverImage and pdf are required");
  }

  if (coverImageFile.size > IMAGEKIT_MAX_FILE_SIZE_BYTES) {
    throw new ApiError(400, "coverImage file must be 20MB or smaller");
  }

  if (pdfFile.size > IMAGEKIT_MAX_FILE_SIZE_BYTES) {
    throw new ApiError(400, "pdf file must be 20MB or smaller");
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
    throw new ApiError(409, "book already exists");
  }

  const [coverImageUpload, pdfUpload] = await Promise.all([
    uploadBufferToImageKit(coverImageFile, {
      fileName: buildBookUploadMeta(
        normalizedTitle,
        "cover",
        path.extname(coverImageFile.originalname).replace(".", "") || "jpg"
      ),
      folder: "/books/covers",
      tags: ["book", "cover-image"],
    }),
    uploadBufferToImageKit(pdfFile, {
      fileName: buildBookUploadMeta(normalizedTitle, "book", "pdf"),
      folder: "/books/pdfs",
      tags: ["book", "pdf"],
    }),
  ]);

  const book = await BookSchema.create({
    title: normalizedTitle,
    author: normalizedAuthors,
    description: description.trim(),
    genre: genre.trim().toLowerCase(),
    coverImage: coverImageUpload.url,
    coverImageFileId: coverImageUpload.fileId,
    pdf: pdfUpload.url,
    pdfFileId: pdfUpload.fileId,
    language: language.trim().toLowerCase(),
  });

  return res.status(201).json(new ApiResponse(201, { book }, "book uploaded successfully"));
});
