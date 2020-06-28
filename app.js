const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const multer = require("multer");
const graphqlHttp = require("express-graphql");

const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/auth");
const { clearImage } = require("./util/file");

// Setting up dotenv to use .env files
dotenv.config();

// Seting up MongoDB_URI
const MONGODB_URI = `${process.env.MONGODB_URI}`;

// Setup routes for feed
// const feedRoutes = require("./routes/feed");
// const authRoutes = require("./routes/auth");

// Create express server
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "images");
  },
  filename: (req, file, callBack) => {
    // NOTICE: If ran into isLoggedIn trouble, create image folder if you haven't
    // gotten one Or install uuid package (Windows only)
    callBack(
      null,
      new Date().toISOString().replace(/:/g, "-") + file.originalname
    );
  },
});

const fileFilter = (req, file, callBack) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    callBack(null, true);
  } else {
    callBack(null, false);
  }
};

// Setup bodyParser for parsing incoming request as JSON
app.use(bodyParser.json());

app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("image")
);

// Setup images serving statically
app.use("/images", express.static(path.join(__dirname, "images")));

// Setup header to allow cors request (cross origin resource sharing)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated!");
  }
  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res
    .status(201)
    .json({ message: "File stored.", filePath: req.file.path });
});

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An error occured.";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
  })
);

// Forward requests to feed routes and controllers
// app.use("/feed", feedRoutes);

// Forward request to auth routes and controllers
// app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((result) => {
    app.listen(8080);
    // const server = app.listen(8080);
    // const io = require("./socket").init(server);
    // io.on("connection", (socket) => {
    //   console.log("Client connected");
    // });
  })
  .catch((err) => console.log(err));
