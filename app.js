const path = require('path')
const express = require('express');
const mongoose = require('mongoose');
const privData = require('./priv/priv');
const bodyParser = require("body-parser");
const feedRoutes = require('./routes/feed');
const app = express();
app.use(bodyParser.json())
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*")
    res.setHeader('Access-Control-Allow-Methods', "GET, POST")
    res.setHeader('Access-Control-Allow-Headers', "Content-Type, Authorization");
    next()
});
app.use('/feed', feedRoutes)

app.use((error, req, res, next) => {
    console.log(error);
    const {statusCode = 500, message = 'Unexpected server error'} = error;
    res.status(statusCode).json({message})
})

mongoose.connect(privData.mongo, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(res => {
    app.listen(8080);
}).catch(err => console.log(err))