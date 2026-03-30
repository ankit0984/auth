import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const BooksModels = new Schema(
  {
    uuid: { type: String, required: true, unique: true, default: uuidv4 },
    title: { type: String, required: true, trim: true, index: true },
    author: [{ type: String, required: true, trim: true }],
    genre: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    coverImage: { type: String, required: true },
    coverImageFileId: { type: String, default: null },
    pdf: { type: String, required: true },
    pdfFileId: { type: String, default: null },
    language: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

BooksModels.index({ title: 1, author: 1 }, { unique: true });

export const BookSchema = mongoose.model("Book", BooksModels);
