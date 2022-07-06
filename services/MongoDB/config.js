const mongoose = require('mongoose')
const app = require('express')();

const connectingDB = async () => {
    try {
        await mongoose.connect(app.get('env') === 'development' ? process.env.MONGO_DB_URL_DEV : process.env.MONGO_DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log("DB CONNECTED")
        })
    }
    catch (error) {
        console.error(error)
    }
}

module.exports = { connectingDB }