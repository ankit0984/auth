import { ApiError } from "./ApiError.js";

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

const getImageKitConfig = () => {
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new ApiError(500, "imagekit environment variables are not configured");
  }

  return {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  };
};

const sanitizeFileSegment = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export const buildBookUploadMeta = (title, suffix, extension) => {
  const baseName = sanitizeFileSegment(title) || "book";
  return `${baseName}-${suffix}.${extension}`;
};

export const uploadBufferToImageKit = async (file, { fileName, folder, tags = [] } = {}) => {
  if (!file?.buffer?.length) {
    throw new ApiError(400, "file buffer is required for imagekit upload");
  }

  const { privateKey } = getImageKitConfig();
  const finalFileName = fileName || file.originalname;
  const formData = new FormData();

  formData.append("file", new Blob([file.buffer]), finalFileName);
  formData.append("fileName", finalFileName);
  formData.append("useUniqueFileName", "true");

  if (folder) {
    formData.append("folder", folder);
  }

  if (tags.length) {
    formData.append("tags", tags.join(","));
  }

  const response = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status || 500, result.message || "failed to upload file to imagekit");
  }

  return {
    fileId: result.fileId,
    name: result.name,
    url: result.url,
    thumbnailUrl: result.thumbnailUrl || null,
    filePath: result.filePath,
  };
};
