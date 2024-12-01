const express = require('express')
const permission = require('../../middleware/permission.middleware')

const {
  login,
  // logout,
  register,
  setPassword,
  updatePassword,
} = require('./auth.controller')

const router = express.Router()

router.post('/login', login)
// router.post('/logout', logout)
router.post('/register', register)
router.post('/set-password', setPassword)
router.patch('/update-password', permission(0), updatePassword)

module.exports = router
