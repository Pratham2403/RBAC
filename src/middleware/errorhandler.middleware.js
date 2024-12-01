const { CustomAPIError } = require('../config/apierror')

const errorHandler = (err, req, res, next) => {
  const { message, stack } = err

  const isCustomError = err instanceof CustomAPIError
  const statusCode = isCustomError ? err.statusCode : err.statusCode || 500
  const errorCode = isCustomError ? err.errorCode : 'INTERNAL_SERVER_ERROR'

  let retryAfter
  if (err.name === 'TooManyRequestsError') {
    statusCode = 429
    retryAfter = err.msBeforeNext / 1000
  }

  if (!isCustomError) {
    console.error('Unexpected Error:', {
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString(),
    })
  }

  res.status(statusCode).json({
    success: false,
    errorCode,
    message: message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'production' ? undefined : stack,
    ...(retryAfter && { retryAfter }),
  })
}

module.exports = errorHandler
