const multerErrorMessages = {
  LIMIT_FILE_SIZE: "Uploaded file size must not exceed 20MB",
  LIMIT_FILE_COUNT: "Too many files uploaded",
  LIMIT_UNEXPECTED_FILE: "Unexpected file field in upload request",
  LIMIT_PART_COUNT: "Too many parts in multipart request",
  LIMIT_FIELD_KEY: "Field name is too long",
  LIMIT_FIELD_VALUE: "Field value is too long",
  LIMIT_FIELD_COUNT: "Too many form fields submitted",
};

const resolveErrorResponse = (err) => {
  if (err?.name === "MulterError") {
    return {
      statusCode: 400,
      message: multerErrorMessages[err.code] || err.message || "Invalid upload request",
    };
  }

  return {
    statusCode: err.statusCode || 500,
    message: err.message || "Internal Server Error",
  };
};

const errorHandler = (err, _req, res, _next) => {
  const { statusCode, message } = resolveErrorResponse(err);
  const response = {
    success: false,
    statusCode,
    message,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export { errorHandler };
