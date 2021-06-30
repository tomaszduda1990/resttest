const { validationResult } = require('express-validator');
const posts = [
    {
        _id: "1",
        title: 'First post',
        content: "Lorem ipsum dolor...",
        imageUrl: 'images/bric.jpg',
        creator: { name: "Tomasz Duda"},
        createdAt: new Date()
    },
    // {
    //     _id: "2",
    //     title: 'John yeah',
    //     content: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam fel",
    //     imageUrl: 'images/carmo.jpg',
    //     creator: { name: "John Lennon"},
    //     createdAt: new Date()
    // },
    // {
    //     _id: '3',
    //     title: 'Paul exciting',
    //     content: "s nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae",
    //     imageUrl: 'images/dyn.png',
    //     creator: { name: "Paul McCarthney",},
    //     createdAt: new Date()
    // },
    // {
    //     _id: '4',
    //     title: 'Ringo post Amazing',
    //     content: "reet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem qua",
    //     imageUrl: 'images/pacc.jpg',
    //     creator: { name: "Ringo Star",},
    //     createdAt: new Date()
    // },
];

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts
    })
};

exports.postPost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            message: "Data validation failed",
            errors: errors.array()
        })
    }
    const title = req.body.title;
    const content = req.body.content;
    const _id = new Date().toISOString();
    const creator = {
        name: "Anonym"
    }
    const createdAt = new Date();
    // create post in db
    res.status(201).json({
        message: "Post crested successfully",
        post: {_id, title, content, creator, createdAt}
    })
}
