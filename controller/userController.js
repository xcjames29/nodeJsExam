const User = require("../model/user");
const Token = require("../model/token")
const addNewUser = async({name, email, password}) =>{
    let user =  await User.findOne({email:email});
    console.log("user!!!!!" , user);
    if(!user){
        console.log(email);
        let emailRegex = /.*@.*\..*/
        if(!emailRegex.test(email)){
            return {status: false, message: "Invalid Email ID"};
        }
        try {
            let user = new User({name:name, email:email, password:password, address:[]})
            await user.save();
            return {status: true, result: "Successfully Added"}
        } catch (e) {
            console.log("Error",e.message)
            return {status: false, result: e.message}        
        }
    }
    else{
        return {status: false, result: "Email already Exist!"} 
    }
}

const loginAttemp = async({email,password})=>{
    let user =  await User.findOne({email:email});
    console.log("loginAttemp",user);
    if(!user) return {status: false, result: "Email does not exist."} 
    else{
        if(user.password===password) return {status: true , result:user}
        else return {status: false , result: "Invalid Password"}
    }
}

const storeToken = async(refreshToken,userId)=>{
    try {
        let token = new Token({refreshToken:refreshToken,user:userId});
        await token.save();
        return {status: true, result: "Successfully Added"}
    } catch (e) {
        console.log("Error",e.message)
        return {status: false, result: e.message}        
    }
}


const hasToken = async(userId)=>{
    try {
        let token = await Token.findOne({user:userId});
        if(token){
            return token.refreshToken
        }
        else{
            return false
        }
    } catch (e) {
        console.log("Error",e.message)
        return {status: false, result: e.message}        
    }
}
const updateToken = async(userId,newToken)=>{
    try {
        let token = await Token.findOneAndUpdate({user:userId}, {refreshToken:newToken})
        console.log(token);
    } catch (e) {
        console.log("Error",e.message)
        return {status: false, result: e.message}        
    }
}

const addUserAddress = async(email, addressId)=>{
    try{
        let user =  await User.findOne({email:email});
        console.log(user);
        let newAddress = [...user.address,addressId];
        console.log(newAddress);
        let updatedUser = await User.findOneAndUpdate({email:email},{address:newAddress});
        console.log(updatedUser);
        return {status:true , result:"SuccessfullyAdded"}
    }
    catch(e){
        console.log(e.message);
        return {status:false , result:e.message}
    }
   
}

const getUserAddress = async(email)=>{
    let user = await User.findOne({email:email}).populate("address")
    console.log(user);
    return {status:true ,result:user.address}
}


const deleteAddress = async(email,addressID)=>{
    try{
        let user =  await User.findOne({email:email});
        console.log(user);
        let newAddress = [];
        user.address.forEach(e=>{if(e!==addressID) newAddress.push(e);})
        let updatedUser = await User.findOneAndUpdate({email:email},{address:newAddress});
        console.log(updatedUser);
        return {status:true , result:"Successfully Deleted Address from User!"}
    }
    catch(e){
        console.log(e.message);
        return {status:false , result:e.message}
    }
}


const deleteToken = async (refreshToken)=>{
    try{
        let token =  await Token.deleteOne({refreshToken:refreshToken});
        console.log(token);
        return {status:true , result:"Successfully Deleted token!"}
    }
    catch(e){
        console.log(e.message);
        return {status:false , result:e.message}
    }
}
module.exports = {
    addNewUser,
    loginAttemp,
    storeToken,
    hasToken,
    updateToken,
    addUserAddress,
    getUserAddress,
    deleteAddress,
    deleteToken
}