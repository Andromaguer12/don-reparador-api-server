const mongoose = require('mongoose')

const connectingDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_DB_URL, {
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

module.exports = {connectingDB}