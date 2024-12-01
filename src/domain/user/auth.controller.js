const asyncHandler = require('express-async-handler')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const bcrypt = require('bcrypt')
const UserModel = require('./user.model')
const { sendEmail } = require('./email.service')
const { verifyUserDetails } = require('./user.service')
const jwt = require('jsonwebtoken')
const {
  rateLimiterByIP,
  rateLimiterByUsernameAndIP,
} = require('../../middleware/ratelimiter.middleware')
const {
  BadRequestError,
  NotAuthenticatedError,
  NotFoundError,
  InternalServerError,
} = require('../../config/apierror')

const sendActivationEmail = async (user, email) => {
  const token = crypto.randomBytes(32).toString('hex')

  user.activationToken = token
  user.activationExpires = Date.now() + 3600000
  await user.save()

  const activationLink = `${process.env.CLIENT_ORIGIN}/set-password?token=${token}`

  const templatePath = path.join(__dirname, 'setPasswordEmailTemplate.html')
  let htmlTemplate = fs.readFileSync(templatePath, 'utf-8')

  htmlTemplate = htmlTemplate.replace(/{{activationLink}}/g, activationLink)

  await sendEmail({
    to: email,
    subject: 'Set Your Password',
    html: htmlTemplate,
  })
}

exports.register = asyncHandler(async (req, res) => {
  const { name, username, userType, email } = req.body

  const user = await verifyUserDetails(userType, username, name)
  user.email = email
  await user.save()
  await sendActivationEmail(user, email)

  res.status(201).json({
    success: true,
    message:
      'User registered successfully. Please check your email to set your password.',
  })
})

exports.setPassword = asyncHandler(async (req, res) => {
  const { newPassword, token } = req.body
  const user = await UserModel.findOne({
    activationToken: token,
    activationExpires: { $gt: Date.now() },
  })

  if (!user) {
    await UserModel.updateOne(
      { activationToken: token },
      {
        $set: { activationToken: undefined, activationExpires: undefined },
      }
    )
    throw new BadRequestError('Invalid or expired token.')
  }

  user.password = await bcrypt.hash(newPassword, 10)
  user.active = true
  user.activationToken = undefined
  user.activationExpires = undefined
  await user.save()

  res.json({
    success: true,
    message: 'Password has been set successfully. Your account is now active.',
  })
})

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body
  const ipAddr = req.ip

  await rateLimiterByUsernameAndIP.consume(`${username}_${ipAddr}`)
  await rateLimiterByIP.consume(ipAddr)

  const user = await UserModel.findByCredentials(username, password)
  if (!user) {
    throw new NotAuthenticatedError('Invalid username or password.')
  }

  await rateLimiterByUsernameAndIP.delete(`${username}_${ipAddr}`)
  await rateLimiterByIP.delete(ipAddr)

  // req.user.userId = user.id
  // req.user.userType = user.userType

  const token = jwt.sign(
    {
      userId: user.id,
      userType: user.userType,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  res.status(200).json({
    message: 'Logged in successfully',
    token,
    success: true,
  })
})

// exports.logout = (req, res) => {
//   req.user.destroy((err) => {
//     if (err) {
//       console.log(err)
//     } else {
//       res.send('Session is destroyed')
//     }
//   })
// }

exports.resetUser = asyncHandler(async (req, res) => {
  const { username } = req.params
  const user = await UserModel.findOne({ username })

  if (!user) {
    throw new NotFoundError('User not found')
  }
  user.password = undefined
  user.email = undefined
  user.active = false
  await user.save()

  res.status(200).json({
    success: true,
    message: 'User has been reset successfully',
    user: {
      username: user.username,
      userType: user.userType,
      active: user.active,
    },
  })
})

exports.updatePassword = asyncHandler(async (req, res) => {
  const { newPassword, oldPassword } = req.body

  const user = await UserModel.findById(req.user.userId)
  const isMatch = await bcrypt.compare(oldPassword, user.password)

  if (!isMatch) {
    throw new BadRequestError('Invalid old password')
  }

  user.password = await bcrypt.hash(newPassword, 10)
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Password has been updated successfully',
  })
})
