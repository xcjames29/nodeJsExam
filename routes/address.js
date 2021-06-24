const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const UserController = require("../controller/userController");
const AddressController = require("../controller/addressController");



router.use("/:id")
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
                else {
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
                let deleteResult = await UserController.deleteAddress(email, req.params.id)
                if (deleteResult.status) {
                    res.status(200).send(deleteResult.status)
                }
                else {
                    res.status(400).send("Deletion Unsuccessful");
                }
                let addressDeleteResult = await AddressController.deleteAddress(req.params.id);
                if (addressDeleteResult.status) {
                    res.status(200).send(addressDeleteResult.status)
                }
                else {
                    res.status(400).send("Deletion Unsuccessful");
                }
            } catch (e) {
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
                let { city, pincode, state, country, addressLine1, addressLine2, label } = req.body;
                let updateAddress = await AddressController.updateAddress(addressId, city, pincode, state, country, addressLine1, addressLine2, label);
                if (updateAddress.status) {
                    res.status(200).send(updateAddress.result);
                }
                else {
                    res.send(400).send(updateAddress.result)
                }
            }
            catch (e) {
                console.log(e.message);
                res.status(403).send("Token is expired! request post to /token to get new access_token");
            }
        }
    })