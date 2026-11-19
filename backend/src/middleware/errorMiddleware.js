
const errorMiddleware = (err, req, res, next) => {
  console.error(err.message);

  let statusCode = err.status || 500;
  let message = err.message || "Internal server error.";

  if (err.response) {
    statusCode = err.response.status === 404 ? 404 : 502;
    message =
      err.response.status === 404
        ? "GitHub pull request or repository not found."
        : "Unable to retrieve information from GitHub.";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid analysis ID.";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;
