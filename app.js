var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var poly_api = require("./utils/poly-api");
var db = require("./utils/db");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var resetRouter = require("./routes/resetPassword");
var settingsRouter = require("./routes/settings");
var moodleRouter = require("./routes/moodle");
var cors = require("cors");
var moodle = require("./utils/moodle-api");
const writeClasses = require("./utils/db-writeclass");
const https = require("https");
const fs = require("fs");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/reset-pass", resetRouter);
app.use("/moodle", moodleRouter);
app.use("/settings", settingsRouter);

//db stuff
db.db_connection();

//ssl
app.use("/", (req, res, next) => {
  res.send("hello from ssl");
});
const sslserver = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
  },
  app
);

sslserver.listen(3300, () => console.log("secure server on port 3300"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(async function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
