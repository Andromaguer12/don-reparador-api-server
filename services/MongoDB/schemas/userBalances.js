const mongoose = require("mongoose")

const {Schema} = mongoose;

const BalanceSchema = new Schema({
    owner: {type: String, required: true },
    encrypted: {type: String, required: true },
    key: {type: String, required: true },
}) 

module.exports = mongoose.model("UserBalance", BalanceSchema)