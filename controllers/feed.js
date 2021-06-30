exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{title: 'first post', content: "Lorem ipsum dolor..."}, {
            title: 'second post',
            content: "Lorem ipsum dolor Lorem ipsum dolorLorem ipsum dolorLorem ipsum dolor"
        }]
    })
};

exports.postPost = (req,res,next) => {
    const title = req.body.title;
    const content = req.body.content;
    const id = new Date().toISOString();
   // create post in db
   res.status(201).json({
       message: "Post crested successfully",
       body: {id, title, content}
   })
}
