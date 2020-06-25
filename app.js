const express = require("express");
const bodyParser = require("body-parser");

// Setup routes for feed
const feedRoutes = require("./routes/feed");

// Create express server
const app = express();

// Setup bodyParser for parsing incoming request as JSON
app.use(bodyParser.json());

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

app.listen(8080);
