const asyncHandler = require('express-async-handler')
const { BadRequestError, NotFoundError } = require('../../config/apierror')
const Image = require('./image.model')
const Category = require('./category.model')
const fs = require('fs')
const path = require('path')
const cache = require('memory-cache')

exports.uploadImages = asyncHandler(async (req, res) => {
  const { category } = req.body
  if (!req.files || req.files.length === 0) {
    throw new BadRequestError('No files were uploaded.')
  }

  const existingCategory = await Category.findOne({ name: category })
  if (!existingCategory) {
    throw new NotFoundError('Category not found.')
  }

  const images = req.files.map((file) => ({
    name: file.originalname,
    filePath: file.path,
    category: existingCategory._id,
    categoryName: existingCategory.name,
  }))

  await Image.insertMany(images)
  res
    .status(201)
    .json({ success: true, message: 'Files successfully uploaded.' })
})

exports.getImageById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const cachedImage = cache.get(id)

  if (cachedImage) {
    res.setHeader('Content-Type', cachedImage.contentType)
    return res.send(cachedImage.data)
  }

  const image = await Image.findById(id)
  if (!image) {
    throw new NotFoundError('Image not found.')
  }

  const imagePath = path.resolve(image.filePath)

  if (!fs.existsSync(imagePath)) {
    throw new NotFoundError('Image not found.')
  }
  const imageBuffer = fs.readFileSync(imagePath)
  const contentType = `image/${path.extname(imagePath).slice(1)}`
  cache.put(id, { data: imageBuffer, contentType }, 60000)

  res.setHeader('Content-Type', contentType)
  res.send(imageBuffer)
})

exports.updateTitle = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { title } = req.body
  if (title === null) {
    throw new BadRequestError('Title cannot be null.')
  }

  const updatedImage = await Image.findByIdAndUpdate(
    id,
    { title },
    { new: true }
  )

  if (!updatedImage) {
    throw new NotFoundError('Image not found.')
  }

  res.status(200).json({
    success: true,
    message: 'Title updated successfully.',
    data: updatedImage,
  })
})

exports.deleteImageById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const image = await Image.findById(id)
  await Image.findByIdAndDelete(id)
  if (!image) {
    return res.status(404).json({ success: false, message: 'Image not found.' })
  }
  const imagePath = path.resolve(image.filePath)
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath)
  } else {
    console.warn('Image file not found on disk:', imagePath)
  }

  await Image.findByIdAndDelete(id)
  cache.del(id)
  res.json({ success: true, message: 'Image deleted successfully.' })
})

exports.getImagesByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params
  let images
  if (!categoryId) {
    images = await Image.find().sort({
      createdAt: -1,
    })
  } else {
    const category =
      (await Category.findOne({ name: categoryId.toUpperCase() })) ||
      (await Category.findById(categoryId))

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found.' })
    }

    images = await Image.find({ category: category._id }).sort({
      createdAt: 1,
    })
  }

  const imagesWithLinks = images.map((image) => ({
    ...image.toObject(),
    imageLink: `${process.env.SERVER_ORIGIN}/api/gallery/image/${image._id
      }`,
  }))

  res.status(200).json({ success: true, data: imagesWithLinks })
})

exports.createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body
  const existingCategory = await Category.findOne({ name })
  if (existingCategory) {
    throw new BadRequestError('Category with this name already exists')
  }
  const category = new Category({ name })
  await category.save()
  res.send(category)
})

exports.getAllCategories = asyncHandler(async (req, res) => {
  let { active } = req.params
  active = active ?? true
  const categories = await Category.find({ active })
  res.send(categories)
})

exports.toggleActivity = asyncHandler(async (req, res) => {
  const { categoryId } = req.params
  if (!categoryId) {
    throw new BadRequestError('Not a valid category')
  }

  const category = await Category.findById(categoryId)
  category.active = !category.active

  await category.save()

  res.json({
    sucess: true,
    message: 'Activity of category is now changed.',
    category,
  })
})
