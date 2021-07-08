const express = require('express');
const {body} = require('express-validator');
const router = express.Router();
const User = require('../models/user')
const authController = require('../controllers/auth')
const isAuth = require('../middleware/isAuth')
router.put('/signup', [
    body('email').isEmail().withMessage('Please enter a valid email').custom((value, {req}) => {
        return User.findOne({email: value}).then(userObj => {
            if(userObj){
                return Promise.reject('Email address already exists')
            }
        })
    }).normalizeEmail(),
    body('password').trim().isLength({
        min: 5,
        max: 20
    }),
    body('name').trim().not().isEmpty().isLength({
        max: 20,
        min: 5
    })
], authController.signup)
router.post('/login', body('email').normalizeEmail(), authController.postLogin);
router.get('/status', isAuth, authController.getStatus);
router.patch('/status', isAuth, [
    body('status').trim().not().isEmpty()
], authController.patchStatus);
module.exports = router;