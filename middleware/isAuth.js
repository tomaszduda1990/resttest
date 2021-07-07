const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    let decodedToken;
    try {
        const token = req.get("Authorization").split(" ")[1];
        decodedToken = jwt.verify(token, 'supersecretsecrettoken')
    }catch (e) {
        e.statusCode = 500;
        e.message = 'Failed to authenticate';
        throw e;
    }
    if(!decodedToken){
        const err = new Error('Token fail');
        err.statusCode = 401;
        throw err
    }
    req.userId = decodedToken.userId;
    next()
}