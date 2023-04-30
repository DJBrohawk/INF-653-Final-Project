require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

//connect to MongoDB

connectDB();

//app.use(cors(corsOptions));

//built in middleware to handle urlencoded data
// in other words, form data:
// 'content-type: application/x-www-form-encoded'
app.use(express.urlencoded({extended: false}));

//built in middleware for json
app.use(express.json());

//you can app.use('/*', require...) to override the below and have all directories

app.use('/states', require('./api/states'));


app.use('/*', (req, res) => {

    res.status(404);
    return res.json({"message": "404 not found"});


})

//app.listen, checking connection
mongoose.connection.once('open', () => {

    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});