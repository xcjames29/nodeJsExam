const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    address:{
        type:[mongoose.SchemaTypes.ObjectId],
        ref:"Address"
    }
},{timespams:true})

const UserModel = new mongoose.model('User',UserSchema);


module.exports = UserModel;