const User = require('../models/user');
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 500;
        error.data = errors.array();
        throw error;
    }
    const {email, name, password} = req.body;
    try {
        const hashedPw = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            name,
            password: hashedPw
        })
        const result = await user.save();
        res.status(201).json({message: "User created", userId: result._id})
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postLogin = async (req, res, next) => {
    const {email, password} = req.body;
    console.log("EMAIL", email)
    let loadedUser;
    try {
        const user = await User.findOne({email: email});
        if (!user) {
            const error = new Error('USER WITH THIS EMAIL CANNOT BE FOUND IN DB');
            error.statusCode = 401;
            throw error
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
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
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}

exports.getStatus = async (req, res, next) => {
    try {
        const usr = await User.findById(req.userId)
        if (!usr) {
            const err = new Error('CANNOT FIND A USER')
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({
            status: usr.status
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}

exports.patchStatus = async (req, res, next) => {
    const newStatus = req.body.status;
    try{
        const user = await User.findById(req.userId);
        if (!user) {
            const err = new Error('CANNOT FIND A USER')
            err.statusCode = 404;
            throw err;
        }
        user.status = newStatus;
        console.log(user)
        await user.save();
        res.status(200).json({
            message: 'Status correctly set'
        })
    }catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}