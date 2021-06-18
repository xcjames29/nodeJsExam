//city, pincode, state, country, addressLine1, addressLine2, label
const mongoose = require("mongoose");
const AddressSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true
    },
    pincode:{
        type: Number,
        required: true,
    },
    state:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    addressLine1:{
        type: String,
        required: true
    },
    addressLine2:{
        type: String,
    },
    label:{
        type: String,
        required:true
    },
},{timespams:true})

const AddressrModel = new mongoose.model('Address',AddressSchema);


module.exports = AddressrModel;