var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const bodyParser = require("body-parser");

var auth = require("./routes/auth");
var courses = require("./routes/ue");
var user = require("./routes/user");
var teachers = require("./routes/teachers");
var students = require("./routes/students");
var questions = require("./routes/questions");
var classRooms = require("./routes/classRoom");
var ratting = require("./routes/ratting");
var mtc = require("./routes/ModuleTeacherClass");
var sol = require("./routes/solanaTransactions.js");
var up = require("./routes/up");

var dashboard = require("./routes/dashboard");

const authenticateToken = require("./middleware/authorize");

var app = express();
app.use(bodyParser.json({ limit: "10mb" }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: [
      "http://localhost:3030",
      "http://localhost:4200",
      "http://localhost:443",
      "https://espritmobile.ovh",
      "http://espritmobile.ovh",


    ],

    // "true" will copy the domain of the request back
    // to the reply. If you need more control than this
    // use a function.

    credentials: true, // This MUST be "true" if your endpoint is
    // authenticated via either a session cookie
    // or Authorization header. Otherwise the
    // browser will block the response.

    methods: "POST,GET,PUT,OPTIONS,DELETE,PATCH", // Make sure you're not blocking
    // pre-flight OPTIONS requests
  })
);

app.use("/api/auth", auth);
app.use("/api/ue", authenticateToken, courses);
app.use("/api/user", authenticateToken, user);
app.use("/api/teacher", authenticateToken, teachers);
app.use("/api/students", authenticateToken, students);
app.use("/api/questions", authenticateToken, questions);
app.use("/api/class-rooms", authenticateToken, classRooms);
app.use("/api/ratting", authenticateToken, ratting);
app.use("/api/mtc", authenticateToken, mtc);
app.use("/api/dashboard", authenticateToken, dashboard);
app.use("/api/sol", authenticateToken, sol);
app.use("/api/up", authenticateToken, up);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log(req.url)
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
