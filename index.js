const mongoose = require('mongoose')
const express = require('express')
const { createServer } = require('http')
const { config } = require('dotenv')
config()

const { bootstrap } = require('./src/loader')

const exitHandler = (server) => {
  if (server) {
    server.close(async () => {
      console.log('Server closed')
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
}

const unExpectedErrorHandler = (server) => {
  return function (error) {
    console.error(error)
    exitHandler(server)
  }
}

const startServer = async () => {
  const app = express()
  await bootstrap(app)

  const httpServer = createServer(app)
  const port = process.env.PORT

  const server = httpServer.listen(port, () => {
    console.log(`server listening on port ${port}`)
  })

  process.on('uncaughtException', unExpectedErrorHandler(server))
  process.on('unhandledRejection', unExpectedErrorHandler(server))
  process.on('SIGTERM', () => {
    console.log('SIGTERM recieved')
    if (server) {
      server.close()
    }
  })

  mongoose.connection.on('error', (err) => {
    console.log(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`)
  })
}

startServer()

