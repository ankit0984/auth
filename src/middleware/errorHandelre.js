const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    statusCode,
    message: err.message || "Internal Server Error",
    // errors: err.errors || [],   //store error stacks
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export { errorHandler };
