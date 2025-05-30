class EError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
    // If details is an Error, append its stack trace.
    if (details instanceof Error && details.stack) {
      this.stack += "\nCaused by: " + details.stack;
    }
  }
}

module.exports = EError;