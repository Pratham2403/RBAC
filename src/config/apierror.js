class CustomAPIError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
  }

  static createErrorClass(
    statusCode,
    errorCode,
    defaultMessage = process.env.NODE_ENV === 'production'
      ? 'An error occurred'
      : 'Internal Server Error'
  ) {
    return class extends CustomAPIError {
      constructor(message = defaultMessage) {
        super(message, statusCode, errorCode)
      }
    }
  }
}

const NotFoundError = CustomAPIError.createErrorClass(
  404,
  'NOT_FOUND',
  'Resource not found'
)

const InternalServerError = CustomAPIError.createErrorClass(
  500,
  'INTERNAL_SERVER_ERROR',
  'Internal server error'
)
const NotAuthenticatedError = CustomAPIError.createErrorClass(
  401,
  'NOT_AUTHENTICATED',
  'User not authenticated'
)
const NotAuthorizedError = CustomAPIError.createErrorClass(
  401,
  'NOT_AUTHORIZED',
  'User not authorized'
)

const PermissionDeniedError = CustomAPIError.createErrorClass(
  403,
  'PERMISSION_DENIED',
  'Permission denied'
)
const BadRequestError = CustomAPIError.createErrorClass(
  400,
  'BAD_REQUEST',
  'Bad request'
)

const TooManyRequestsError = CustomAPIError.createErrorClass(
  429,
  'TOO_MANY_REQUESTS',
  'Too many requests - please try again later'
)

module.exports = {
  CustomAPIError,
  NotFoundError,
  InternalServerError,
  NotAuthenticatedError,
  PermissionDeniedError,
  BadRequestError,
  TooManyRequestsError,
  NotAuthorizedError,
}
