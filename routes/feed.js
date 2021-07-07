const express = require('express');
const {body} = require('express-validator')
const isAuth = require('../middleware/isAuth')
const feedController = require('../controllers/feed');
const router = express.Router();


// GET /feed/posts
router.get('/posts', isAuth,feedController.getPosts);
router.post('/post', isAuth, [
    body('title').trim().isLength({
        min: 5,
        max: 20
    }),
    body("content").trim().isLength({
        min: 5,
        max: 300
    })
], feedController.postPost);

router.put('/post/:postId', isAuth, [
    body('title').trim().isLength({
        min: 5,
        max: 20
    }),
    body("content").trim().isLength({
        min: 5,
        max: 300
    })
], feedController.editPost);

router.delete('/post/:postId', isAuth, feedController.deletePost);

router.get('/post/:postId', isAuth, feedController.getPost);

module.exports = router;