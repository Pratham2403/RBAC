const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const compression = require('compression')
const path = require('path')
const bodyParser = require('body-parser')
const ExpressMongoSanitize = require('express-mongo-sanitize')
const api = require('./api.js')
const { notFound, errorHandler } = require('../middleware/index.middleware.js')

const bootstrapExpress = (app, mongooseConnection) => {
  app.use(ExpressMongoSanitize())
  app.disable('x-powered-by')

  // Basic security headers
  app.use(helmet())
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'trusted-cdn.com'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    })
  )
  app.use(
    helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true })
  )

  // Parse JSON and handle compression
  app.use(express.json())
  app.use(compression())
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))

  // CORS configuration
  // const corsOptions = {
  //   origin: process.env.CLIENT_ORIGIN,
  // }
  app.use(cors())

  // Trust proxy in production
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
  }

  // API routes
  app.use('/api/', api)

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(
      express.static(path.join(__dirname, '../../../cses-website-mfe/dist'))
    )
    app.get('/*', (req, res) =>
      res.sendFile(
        path.join(__dirname, '../../../cses-website-mfe/dist', 'index.html')
      )
    )
  }

  app.use(notFound)
  app.use(errorHandler)
}

module.exports = { bootstrapExpress }
