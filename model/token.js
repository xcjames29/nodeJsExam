const mongoose = require("mongoose");
const TokenSchema = new mongoose.Schema({
    refreshToken: {
        type: String,
        required: true,
        unique:true
    },
    user:{
        type: mongoose.SchemaTypes.ObjectId,
        ref:"User"
    }
},{timespams:true})

const TokenModel = new mongoose.model('Token',TokenSchema);


module.exports = TokenModel;