const express = require('express')
const router = express.Router()
const permission = require('../../middleware/permission.middleware')
const upload = require('../../middleware/upload.middleware')

const {
  uploadImages,
  createCategory,
  getAllCategories,
  getImagesByCategory,
  getImageById,
  deleteImageById,
  updateTitle,
  toggleActivity,
} = require('./image.controller')

router.post(
  '/upload',
  permission(3),
  upload('permanent').array('files', 10),
  uploadImages
)
router.post('/categories', permission(4), createCategory)
router.get('/categories', getAllCategories)
router.patch('/categories/:categoryId', permission(3), toggleActivity)
router.get('/images/category/:categoryId?', getImagesByCategory)
router.get('/image/:id', getImageById)
router.delete('/image/:id', permission(3), deleteImageById)
router.put('/image/:id', permission(3), updateTitle)

module.exports = router
