const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const multer = require("multer");

// Setting up dotenv to use .env files
dotenv.config();

// Seting up MongoDB_URI
const MONGODB_URI = `${process.env.MONGODB_URI}`;

// Setup routes for feed
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

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
  next();
});

// Forward requests to feed routes and controllers
app.use("/feed", feedRoutes);

// Forward request to auth routes and controllers
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
