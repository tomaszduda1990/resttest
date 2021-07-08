const {validationResult} = require('express-validator');
const path = require('path');
const fs = require('fs');
const Post = require('../models/post');
const User = require('../models/user')
exports.getPosts = (req, res, next) => {
    const currentPage = parseInt(req.query.page) || 1;
    const perPage = 2;
    let totalItems;
    Post.find()
        .countDocuments()
        .then(result => {
            totalItems = result;
            return Post.find().skip((currentPage - 1) * perPage).limit(perPage)
        })
        .then(posts => {
            res.status(200).json({
                posts,
                totalItems
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        });
};

exports.postPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Data validation failed")
        error.statusCode = 422;
        throw error
        return res.status(422).json({
            message: "Data validation failed",
            errors: errors.array()
        })
    }
    if (!req.file) {
        const error = new Error('Image has not been provided');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const imageUrl = 'images/' + req.file.filename;
    const content = req.body.content;
    const creator = req.userId;
    const post = new Post({title, imageUrl, content, creator});
    post.save()
        .then(result => {
            return User.findById(req.userId)
        })
        .then(user => {
            if (!user) {
                const error = new Error('user not find')
                error.statusCode = 404;
                throw error;
            }
            user.posts.push(post)
            return user.save()
        })
        .then(result => {
            res.status(201).json({
                message: "Post crested successfully",
                post: post,
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Cannot find post in the database');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                message: 'Found a post',
                post
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            err.message = "Error while trying to get post from db";
            next(err)
        })
}

exports.editPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Data validation failed");
        error.statusCode = 422;
        throw error;
        return res.status(422).json({
            message: "Data validation failed",
            errors: errors.array()
        })
    }
    const postId = req.params.postId,
        title = req.body.title,
        content = req.body.content;
    let imageUrl;
    if (!!req.file) {
        imageUrl = 'images/' + req.file.filename;
    }
    Post.findById(postId)
        .then(p => {
            if (!p) {
                console.log('DISPLAY ERROR ON INVALID PRODUCT')
                const error = new Error('Cannot find post in the database');
                error.statusCode = 404;
                throw error;
            }
            console.log(req.userId.toString() !== p.creator.toString())
            if (req.userId.toString() !== p.creator.toString()) {
                const error = new Error('not authorized');
                if (!error.statusCode) {
                    error.statusCode = 403;
                }
                throw error;
            }
            p.title = title;
            p.content = content;
            p.imageUrl = imageUrl || p.imageUrl;
            console.log(p.imageUrl)
            if (imageUrl !== p.imageUrl) {
                clearImage(p.imageUrl);
            }
            console.log('FINAL PRODUCT',p)
            return p.save()
        })
        .then(result => {
            res.status(200).json({message: 'Succesfully updated post.', post: result})
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            err.message = "Error while trying to get post from db EDITING";
            next(err)
        })
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(p => {
            if (!p) {
                const error = new Error('Cannot find post in the database');
                error.statusCode = 404;
                throw error;
            }
            if (req.userId.toString() !== p.creator.toString()) {
                const error = new Error('not authorized');
                if (!error.statusCode) {
                    error.statusCode = 403;
                }
                throw error;
            }
            clearImage(p.imageUrl);
            return Post.findByIdAndRemove(postId)
        })
        .then(result => {
            return User.findById(req.userId)
        })
        .then(result => {
            user.posts.pull(postId)
            return user.save()
        })
        .then(result => {
            res.status(200).json({message: 'deleted resource'})
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            err.message = "Error while trying to get post from db";
            next(err)
        })
}

const clearImage = imagePath => {
    const filePath = path.join(__dirname, '..', imagePath);
    fs.unlink(filePath, err => console.log(err))
}

