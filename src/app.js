const express = require("express");
const hbs = require("hbs");
const path = require("path");
const http = require("http");
require("./db/mongoose");
const userRouter = require("./routers/user");

const app = express();

//define paths for express config
const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "./views");

//setup handlebars engine and views location
app.set("view engine", "hbs");
app.set("views", viewsPath);

app.use(express.json());

//to parse the form details which sent in the req body
app.use(express.urlencoded({ extended: true }));

app.use(express.static(publicDirectoryPath));
app.use(userRouter);

const server = http.createServer(app);

module.exports = server;
