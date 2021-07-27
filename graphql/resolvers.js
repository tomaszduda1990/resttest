const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Post = require('../models/post');
module.exports = {
    createUser: async function ({userInput}, req) {
        const {email, name, password} = userInput;
        const errors = []
        if (!validator.isEmail(email)) {
            errors.push({
                message: "Please provide correct email address"
            })
        }
        console.log("Password length", validator.isLength(password, {min: 5, max: 20}))
        console.log('is Password empty', validator.isEmpty(password))
        if (validator.isEmpty(password) || !validator.isLength(password, {min: 5, max: 20})) {
            errors.push({
                message: `Password is empty: ${validator.isEmpty(password)}, password is not between 5-20 ${validator.isLength(password, {
                    min: 5,
                    max: 20
                })}`
            })
        }

        if (errors.length) {
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
    },
    login: async ({email, password}) => {
        const user = await User.findOne({email});
        if (!user) {
            const error = new Error("User not found");
            error.code = 401;
            throw error
        }
        const isPassCorrect = await bcrypt.compare(password, user.password);
        if (!isPassCorrect) {
            const error = new Error('Password doesnt match');
            error.code = 401;
            throw error;
        }
        const token = jwt.sign({
            userId: user._id.toString(),
            email
        }, 'supersecretsecrettoken', {
            expiresIn: '1h'
        })
        return {
            token,
            userId: user._id.toString()
        }
    },
    createPost: async ({postInput}, req) => {
        if (!req.isAuth) {
            const error = new Error('not authenticated');
            error.code = 422;
            throw error;
        }
        const errors = [];
        if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, {min: 5, max: 20})) {
            errors.push({message: "Title is invalid"})
        }
        if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, {min: 5, max: 200})) {
            errors.push({message: "Content length should be between 5-200 characters"})
        }

        if (errors.length > 0) {
            const error = new Error("invalid input");
            error.data = errors;
            error.code = 422;
            throw error
        }
        const user = await User.findById(req.userId)
        if (!user) {
            const error = new Error('invalid user');
            error.code = 401;
            throw error;
        }

        const post = await new Post({
            title: postInput.title, content: postInput.content, imageUrl: postInput.imageUrl, creator: user
        });

        const createdPost = await post.save();
        user.posts.push(createdPost);
        await user.save()
        return {
            ...createdPost._doc,
            _id: createdPost._doc._id.toString(),
            createdAt: createdPost._doc.createdAt.toISOString(),
            updatedAt: createdPost._doc.updatedAt.toISOString()
        }
    },

    posts: async ({page}, req) => {
        if (!req.isAuth) {
            const error = new Error('not authenticated');
            error.code = 422;
            throw error;
        }
        if (!page) {
            page = 1
        }
        const perPage = 2;
        const totalPosts = await Post.find().countDocuments()
        const posts = await Post.find().skip((page - 1) * perPage).limit(perPage).sort({createdAt: -1}).populate('creator')

        return {
            posts: posts.map(post => ({
                ...post._doc,
                _id: post._id.toString(),
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString()
            })),
            totalPosts
        }
    },

    post: async ({id}, req) => {
        if (!req.isAuth) {
            const error = new Error('not authenticated');
            error.code = 422;
            throw error;
        }

        const post = await Post.findById(id).populate('creator');
        if(!post){
            const error = new Error('post not find');
            error.code = 404;
            throw error;
        }
        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }

    },
    updatePost: async ({id, postInput }, req) => {
        if (!req.isAuth) {
            const error = new Error('not authenticated');
            error.code = 422;
            throw error;
        }
        const post = await Post.findById(id).populate('creator')
        if(!post){
            const error = new Error('post not found');
            error.code = 404;
            throw error;
        }
        if(post.creator._id.toString() !== req.userId.toString()){
            const error = new Error('user not allowed to edit post');
            error.code = 403;
            throw error;
        }
        const errors = [];
        if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, {min: 5, max: 20})) {
            errors.push({message: "Title is invalid"})
        }
        if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, {min: 5, max: 200})) {
            errors.push({message: "Content length should be between 5-200 characters"})
        }

        if (errors.length > 0) {
            const error = new Error("invalid input");
            error.data = errors;
            error.code = 422;
            throw error
        }

        post.title = postInput.title;
        post.content = postInput.content;
        console.log(postInput)
        if(postInput.imageUrl !== 'undefined'){
            post.imageUrl = postInput.imageUrl
        }
        const updatedPost = await post.save();
        return {
            ...updatedPost._doc,
            _id: updatedPost._id.toString(),
            createdAt: updatedPost.createdAt.toISOString(),
            updatedAt: updatedPost.updatedAt.toISOString()
        }

    }
}