const express = require('express')
const auth = require('../domain/user/auth.route')
const users = require('../domain/user/user.route')
const gallery = require('../domain/gallery/image.route')

const router = express.Router()

router.use('/users', users)
router.use('/auth', auth)
router.use('/gallery', gallery)

module.exports = router
