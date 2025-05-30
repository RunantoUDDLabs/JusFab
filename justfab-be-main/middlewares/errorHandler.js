const logger = require("../utils/logger");

// utils/errorHandler.js
module.exports = errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error'
  const errorMessage = `${req.originalUrl} - ${req.body} - ${req.headers?.authorization} \n${err.statusCode} - ${err.message} - ${req.auth?.username || req.auth?.telegramId || ""} \n ${err.stack}`;
  console.error(errorMessage);
  logger.error(errorMessage);
  res.status(statusCode);
  res.json({
    success: false,
    message: message,
    code: statusCode,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};