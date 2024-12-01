const jwt = require('jsonwebtoken')
const {
  PermissionDeniedError,
  NotAuthorizedError,
} = require('../config/apierror')

const UserType = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  ALUMNI: 'ALUMNI',
  STUDENT: 'STUDENT',
}

const PermissionLevel = {
  [UserType.SUPER_ADMIN]: 4,
  [UserType.ADMIN]: 3,
  [UserType.ALUMNI]: 2,
  [UserType.STUDENT]: 1,
}

const permission = (requiredLevel) => (req, res, next) => {
  try {
    let token = req.header('Authorization')
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft()
    }
    const user = jwt.verify(token, process.env.JWT_SECRET)
    req.user = user
  } catch (err) {
    throw new NotAuthorizedError()
  }

  if (!req.user.userId) {
    return next(new NotAuthorizedError())
  }

  const userPermissionLevel = PermissionLevel[req.user.userType]
  if (userPermissionLevel >= requiredLevel) {
    return next()
  }

  next(new PermissionDeniedError('Insufficient permissions'))
}

module.exports = permission
