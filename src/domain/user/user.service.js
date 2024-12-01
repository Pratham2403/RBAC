const { BadRequestError } = require('../../config/apierror')
const UserModel = require('./user.model')

const registerUser = async (
  name,
  username,
  userType,
  gradYear,
  role,
  privateKey
) => {
  if (
    userType === 'SUPER_ADMIN' &&
    privateKey !== process.env.SUPER_ADMIN_PRIVATE_KEY
  ) {
    throw new BadRequestError('Invalid private key for super_admin creation')
  }

  if (userType === 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new BadRequestError('Only super_admin can create admin users')
  }

  if (
    (userType === 'ALUMNI' || userType === 'STUDENT') &&
    role !== 'ADMIN' &&
    role !== 'SUPER_ADMIN'
  ) {
    throw new BadRequestError(
      'Only super_admin or admin can create alumni or student users'
    )
  }

  const existingUser = await UserModel.findOne({ username })
  if (existingUser) {
    throw new BadRequestError('Username already exists')
  }

  const newUser = new UserModel({
    name,
    username,
    userType,
    gradYear,
  })

  await newUser.save()
  return newUser
}

const verifyUserDetails = async (userType, username, name) => {
  const user = await UserModel.findOne({ username, userType, name })
  if (!user) {
    throw new BadRequestError('User not found. Please check your details.')
  }
  if (user.active === true) {
    throw new BadRequestError('User Already Verified, Please Login.')
  }

  return user
}

module.exports = { registerUser, verifyUserDetails }
