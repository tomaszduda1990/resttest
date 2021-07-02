const express = require('express');
const {body} = require('express-validator')
const feedController = require('../controllers/feed');
const router = express.Router();


// GET /feed/posts
router.get('/posts', feedController.getPosts);
router.post('/post', [
    body('title').trim().isLength({
        min: 5  ,
        max: 20
    }),
    body("content").trim().isLength({
        min: 5,
        max: 300
    })
],feedController.postPost);

router.get('/post/:postId', feedController.getPost);

module.exports = router;