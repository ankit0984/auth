import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (file.fieldname === "coverImage" && file.mimetype.startsWith("image/")) {
    return cb(null, true);
  }

  if (file.fieldname === "pdf" && file.mimetype === "application/pdf") {
    return cb(null, true);
  }

  cb(new ApiError(400, `invalid file type for field ${file.fieldname}`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 2,
  },
});

export const uploadBookFiles = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);
