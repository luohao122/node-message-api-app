exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        title: "Post 1",
        content: "Post 1",
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  // Create post in db
  res.status(201).json({
    message: "Post created successfully!",
    post: {
      id: new Date().toISOString().replace(/:/g, "-"),
      title: title,
      content: content,
    },
  });
};
