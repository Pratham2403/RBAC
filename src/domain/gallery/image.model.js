const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    title: String,
  },
  { timestamps: true }
)

const Image = mongoose.model('Image', imageSchema)
module.exports = Image
