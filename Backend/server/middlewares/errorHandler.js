const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If it's not already an ApiError, convert it
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    // Mongoose bad ObjectId
    if (error.name === 'CastError') {
      statusCode = 400;
      message = `Resource not found. Invalid: ${error.path}`;
    }

    // Mongoose duplicate key
    if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue).join(', ');
      message = `Duplicate value entered for field: ${field}`;
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(error.errors)
        .map((val) => val.message)
        .join(', ');
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token. Please log in again.';
    }
    if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired. Please log in again.';
    }

    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;