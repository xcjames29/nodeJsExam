require('dotenv').config();
const jwt = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require('morgan');

const app = express();
const PORT = 8111;

app.use(morgan('dev'));
app.use(express.static('static'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors());


mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("Mongo DB Connected")
}).catch((e)=>{
    console.log(e.message);
});



const UserController = require("./controller/userController");

app.post("/user",async (req,res)=>{
    try{
        console.log(req.body);
        let data = await UserController.addNewUser(req.body);
        console.log(data.result);
        if(data.status) res.status(200).send(data.result)
        else res.status(401).send(data.result)
    }
    catch(e){
        console.log(e.message)
        res.status(403).send("Somthing went wrong!" + " " + e.message);
    }
})


app.post("/login", async (req,res)=>{
    try{
        console.log("Login Attemp!");
        console.log(req.body);
        let data = await UserController.loginAttemp(req.body);
        console.log("data?", data)
        if (data.status) {
            let payload = {
                'email': data.result.email
            }
            let token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME});
            let hasToken = await UserController.hasToken(data._id);
            let refreshToken;
            if(hasToken){
                try{
                  let dbToken =  jwt.verify(hasToken, process.env.ACCESS_TOKEN_SECRET);
                  console.log("verify dbRToken", dbToken)
                  refreshToken = hasToken;
                }
                catch(e){
                    console.log(e.message);
                    refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME});
                    let refreshTokenData = await UserController.updateToken(data._id,refreshToken);
                    console.log(refreshTokenData)
                }
            }
            else{
                refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME});
                let refreshTokenData = await UserController.storeToken(refreshToken,data._id);
                console.log(refreshTokenData)
            }
            
            res.status(200).send({ status:true, result:{'ACCESS_TOKEN':token, "REFRESH_TOKEN":refreshToken}});
        }
        else{
            res.status(400).send(data)
        }
    }
    catch(e){
        console.log("WUUUUUUUT",e.message)
    }
})

app.post("/token", (req,res)=>{
    console.log("DATAAAAAAA",req.body);
    let {refreshToken} = req.body;
    try{
        let data = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log(data);
        let newToken = jwt.sign({email:data.email},process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME})
        res.status(200).send({status:true, result:{'ACCESS_TOKEN':newToken}});
    }
    catch(e){
        console.log(e);
        res.status(403).send("Refresh Token Expired");
    }
})


app.post("")


app.listen(PORT,()=>{
    console.log("Server Listening to Port: " +PORT);
})