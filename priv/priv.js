const privData = {
    mongo: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@project0.983js.mongodb.net/${process.env.MONGO_DEFAULT_DB}`
}

module.exports = privData;