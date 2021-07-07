const User = require('../models/user');
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 500;
        error.data = errors.array();
        throw error;
    }
    const {email, name, password} = req.body;
    bcrypt.hash(password, 12).then(hashedPw => {
        const user = new User({
            email,
            name,
            password: hashedPw
        })
        return user.save()
    })
        .then(result => {
            res.status(201).json({message: "User created", userId: result._id})
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.postLogin = (req, res, next) => {
    const {email, password} = req.body;
    console.log("EMAIL", email)
    let loadedUser;
    User.findOne({email: email})
        .then(user => {
            console.log(user)
            if (!user) {
                const error = new Error('USER WITH THIS EMAIL CANNOT BE FOUND IN DB');
                error.statusCode = 401;
                throw error
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password)
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Incorrect password');
                error.statusCode = 401;
                throw error
            }
            const token = jwt.sign({
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
                }, 'supersecretsecrettoken',
                {
                    expiresIn: '1h'
                }
            );
            res.status(200).json({
                token: token, userId: loadedUser._id.toString()
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        })
}