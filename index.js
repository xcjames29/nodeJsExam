require('dotenv').config();
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


const addressRouter = require("./routes/address");
app.use("/address",addressRouter)

const userRouter = require("./routes/user")
app.use(userRouter);


app.listen(PORT, () => {
    console.log("Server Listening to Port: " + PORT);
})