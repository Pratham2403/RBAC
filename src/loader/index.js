const { bootstrapExpress } = require('./app')
const { connectToDB } = require('../config/mongoose')

const bootstrap = async (app) => {
  await connectToDB()
  bootstrapExpress(app)
}

module.exports = { bootstrap }
