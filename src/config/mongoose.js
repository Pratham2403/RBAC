const { connect, set } = require('mongoose')

const connectToDB = async () => {
    try {
        set('strictQuery', false)
        const db = await connect(process.env.MONGO_DB_URI)
        console.log('MongoDB connected to', db.connection.name)
    } catch (error) {
        console.error(error)
    }
}

module.exports = { connectToDB }
