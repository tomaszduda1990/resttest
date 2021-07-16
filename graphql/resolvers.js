const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator')
module.exports = {
    createUser: async function ({userInput}, req) {
        const {email, name, password} = userInput;
        const errors = []
        if(!validator.isEmail(email)){
            errors.push({
                message: "Please provide correct email address"
            })
        }
        console.log("Password length",validator.isLength(password, { min: 5, max: 20}))
        console.log('is Password empty', validator.isEmpty(password))
        if(validator.isEmpty(password) || !validator.isLength(password, { min: 5, max: 20})){
            errors.push({
                message: `Password is empty: ${validator.isEmpty(password)}, password is not between 5-20 ${validator.isLength(password, {min: 5, max: 20})}`
            })
        }

        if(errors.length){
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error
        }
        const existingUser = await User.findOne({email})
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 500;
            throw error;
        }
        const hashedPwd = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            name,
            password: hashedPwd
        })
        const createdUser = await user.save();
        return {
            ...createdUser._doc,
            _id: createdUser._id.toString()
        }
    }
}