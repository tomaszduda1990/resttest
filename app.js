const path = require('path');
const {graphqlHTTP } = require('express-graphql')
const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const privData = require('./priv/priv');
const bodyParser = require("body-parser");
const app = express();


const fileStorage = multer.diskStorage({
    destination: 'images',
    filename: (req, file, cb) => {
        const timestamp = new Date().getTime().toString();
        cb(null, timestamp + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter}).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*")
    res.setHeader('Access-Control-Allow-Methods', "GET, PUT, POST, DELETE, PATCH");
    res.setHeader('Access-Control-Allow-Headers', "Content-Type, Authorization");
    next()
});

app.use('/graphql', graphqlHTTP ({
    schema: graphqlSchema,
    rootValue: graphqlResolver
}));


app.use((error, req, res, next) => {
    console.log(error);
    const {statusCode = 500, message = 'Unexpected server error', data} = error;

    res.status(statusCode).json({message, data, statusCode})
})

mongoose.connect(privData.mongo, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(res => {
    app.listen(8080);
}).catch(err => console.log(err))