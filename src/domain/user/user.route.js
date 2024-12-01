const express = require('express')
const router = express.Router()
const permission = require('../../middleware/permission.middleware')
const upload = require('../../middleware/upload.middleware')
const {
  register,
  bulkRegister,
  getAllUsers,
  getUserDetails,
  resetUser,
} = require('./user.controller')

router.route('/register').post(register)
router.route('/bulk-register').post(upload('temp').single('file'), bulkRegister)
router.get('/', permission(0), getUserDetails)
router.get('/all', permission(3), getAllUsers)
router.post('/reset', permission(4), resetUser)

module.exports = router
