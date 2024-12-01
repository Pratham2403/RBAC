const multer = require('multer')
const os = require('os')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

function getStorage(storageType) {
  const destinationDir = storageType === 'permanent' ? uploadDir : os.tmpdir()

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationDir)
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname) // Unique file name
    },
  })
}

function upload(storageType = 'temp') {
  const storage = getStorage(storageType)
  return multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })
}

module.exports = upload
