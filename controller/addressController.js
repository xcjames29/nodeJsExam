const Address = require("../model/address");

const addAddress = async (city, pincode, state, country, addressLine1, addressLine2, label) => {
    try {
        let address = new Address({ city: city, pincode: pincode, state: state, country: country, addressLine1: addressLine1, addressLine2: addressLine2, label: label });
        await address.save();
        console.log(address)
        return {status:true, result:"Address successfully added!", id:address._id}
    }
    catch (e) {
        console.log("ADDING ADDRESS ERROR",e.message)
        return {status:false, result:e.message}
    }
}

const updateAddress = async (id,city, pincode, state, country, addressLine1, addressLine2, label) => {
    try {
        let address = await Address.findOneAndUpdate({_id:id},{ city: city, pincode: pincode, state: state, country: country, addressLine1: addressLine1, addressLine2: addressLine2, label: label });
        console.log(address)
        return {status:true, result:"Address successfully updated!"}
    }
    catch (e) {
        console.log("Update ADDRESS ERROR",e.message)
        return {status:false, result:e.message}
    }
}

module.exports ={
    addAddress,
    updateAddress    
}