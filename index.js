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
}).then(() => {
    console.log("Mongo DB Connected")
}).catch((e) => {
    console.log(e.message);
});



const UserController = require("./controller/userController");
const AddressController = require("./controller/addressController");


app.post("/user", async (req, res) => {
    try {
        console.log(req.body);
        let data = await UserController.addNewUser(req.body);
        console.log(data.result);
        if (data.status) res.status(200).send(data.result)
        else res.status(401).send(data.result)
    }
    catch (e) {
        console.log(e.message)
        res.status(403).send("Somthing went wrong!" + " " + e.message);
    }
})


app.post("/login", async (req, res) => {
    try {
        console.log("Login Attemp!");
        console.log(req.body);
        let data = await UserController.loginAttemp(req.body);
        console.log("data?", data)
        if (data.status) {
            let payload = {
                'email': data.result.email
            }
            let token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME });
            let hasToken = await UserController.hasToken(data._id);
            let refreshToken;
            if (hasToken) {
                try {
                    let dbToken = jwt.verify(hasToken, process.env.ACCESS_TOKEN_SECRET);
                    console.log("verify dbRToken", dbToken)
                    refreshToken = hasToken;
                }
                catch (e) {
                    console.log(e.message);
                    refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME });
                    let refreshTokenData = await UserController.updateToken(data._id, refreshToken);
                    console.log(refreshTokenData)
                }
            }
            else {
                refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME });
                let refreshTokenData = await UserController.storeToken(refreshToken, data._id);
                console.log("--data", refreshTokenData)
            }
            res.status(200).send({ status: true, result: { 'ACCESS_TOKEN': token, "REFRESH_TOKEN": refreshToken } });
        }
        else {
            res.status(400).send(data)
        }
    }
    catch (e) {
        console.log("WUUUUUUUT", e.message)
    }
})

app.post("/token", (req, res) => {
    console.log("DATAAAAAAA", req.body);
    let { refreshToken } = req.body;
    try {
        let data = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log(data);
        let newToken = jwt.sign({ email: data.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME })
        res.status(200).send({ status: true, result: { 'ACCESS_TOKEN': newToken } });
    }
    catch (e) {
        console.log(e);
        res.status(403).send("Refresh Token Expired");
    }
})


app.route("/address/:id")
    .get(async (req, res) => {
        let header = req.headers["authorization"];
        if (!header) {
            res.status(403).send("Token not provided! ");
            return;
        }
        else {
            try {
                let token = header.split(" ")[1];
                let verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                console.log(verifyToken);
                let { email } = verifyToken;
                let userAddress = await UserController.getUserAddress(email);
                console.log(userAddress);
                res.status(200).send(userAddress.result);
            }
            catch (e) {
                console.log(e.message);
                res.status(403).send("Token is expired! request post to /token to get new access_token");
            }
        }

    }).post(async (req, res) => {
        console.log(req.body);
        let header = req.headers["authorization"];
        if (!header) {
            res.status(403).send("Token not provided! ");
            return;
        }
        else {
            try {
                let token = header.split(" ")[1];
                let verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                console.log(verifyToken);
                let { email } = verifyToken;
                let { city, pincode, state, country, addressLine1, addressLine2, label } = req.body;
                let addressId = await AddressController.addAddress(city, pincode, state, country, addressLine1, addressLine2, label);
                console.log(addressId);
                if (addressId.result) {
                    let addAddressToUser = await UserController.addUserAddress(email, addressId.id)
                    console.log(addAddressToUser);
                    if (addAddressToUser.status) {
                        res.status(200).send(addAddressToUser.result);
                    }
                    else {
                        res.status(400).send("Something went wrong");
                    }
                }
                else{
                    res.status(400).send("Something went wrong with adding address");
                }
            }
            catch (e) {
                console.log(e.message);
                res.status(403).send("Token is expired! request post to /token to get new access_token");
            }

        }
    }).delete(async (req, res) => {
        console.log(req.params.id)
        let header = req.headers["authorization"];
        if (!header) {
            res.status(403).send("Token not provided! ");
            return;
        }
        else {
            try {
                let token = header.split(" ")[1];
                let verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                console.log(verifyToken);
                let { email } = verifyToken;
                let deleteResult = await UserController.deleteAddress(email,req.params,id)
                if(deleteResult.status){
                    res.status(200).send(deleteResult.status)
                }
                else{
                    res.status(400).send("Deletion Unsuccessful");
                }
            }catch (e) {
                console.log(e.message);
                res.status(403).send("Token is expired! request post to /token to get new access_token");
            }
        }
    }).patch(async (req, res) => {
        let addressId = req.params.id;
        console.log(req.body);
        let header = req.headers["authorization"];
        if (!header) {
            res.status(403).send("Token not provided! ");
            return;
        }
        else {
            try {
                let token = header.split(" ")[1];
                let verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                console.log(verifyToken);
                let {id, city, pincode, state, country, addressLine1, addressLine2, label } = req.body;
                let updateAddress = await AddressController.updateAddress(id, city, pincode,state, country, addressLine1, addressLine2, label);
                if(updateAddress.status){
                    res.status(200).send(updateAddress.result);
                }
                else{
                    res.send(400).send(updateAddress.result)
                }
            }
            catch(e){
                console.log(e.message);
                res.status(403).send("Token is expired! request post to /token to get new access_token");
            }
        }
    })


app.listen(PORT, () => {
    console.log("Server Listening to Port: " + PORT);
})