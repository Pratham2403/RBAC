const mongoose = require('mongoose')
const { RateLimiterMongo } = require('rate-limiter-flexible')
const mongoConn = mongoose.createConnection(process.env.MONGO_DB_URI)

exports.rateLimiterByUsernameAndIP = new RateLimiterMongo({
  storeClient: mongoConn,
  keyPrefix: 'login_fail_username_ip',
  points: 10,
  duration: 60 * 15,
  blockDuration: 60 * 15,
})

exports.rateLimiterByIP = new RateLimiterMongo({
  storeClient: mongoConn,
  keyPrefix: 'login_fail_ip',
  points: 100,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24,
})
