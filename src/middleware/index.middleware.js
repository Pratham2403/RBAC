const errorHandler = require('./errorhandler.middleware')
const { NotFoundError } = require('../config/apierror')

function notFound(req, res, next) {
  const error = new NotFoundError(`🔍 - Not Found - ${req.originalUrl}`)
  next(error)
}

module.exports = { notFound, errorHandler }
