const AppError = require("../utils/appError");
// Not found error handler
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};


// Global error handling middleware

const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let status = err.status || 'error';
    let message = err.message || 'Internal Server Error';

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        status = 'fail';
        message = Object.values(err.errors).map((el) => el.message).join(', ');
    }

    // Handle Mongoose duplicate key errors
    if (err.code && err.code === 11000) {
        statusCode = 400;
        status = 'fail';
        message = `Duplicate field value entered: ${JSON.stringify(err.keyValue)}`;
    }

    // Handle Mongoose cast errors
    if (err.name === 'CastError') {
        statusCode = 400;
        status = 'fail';
        message = `Invalid ${err.path}: ${err.value}`;
    }

    res.status(statusCode).json({
        status,
        message,
    });
};

module.exports = { notFoundHandler, globalErrorHandler };