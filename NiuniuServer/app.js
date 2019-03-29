var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./game/users');
let adminRouter = require('./routes/admin');

let fs = require('fs');
let fileStreamRotator = require('file-stream-rotator');

// 记录日志到文件
let logDir = __dirname + '/logs';
fs.existsSync(logDir) || fs.mkdirSync(logDir);
let accessLogStream = fileStreamRotator.getStream({
  filename: logDir + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
});
let errLogStream = fileStreamRotator.getStream({
  filename: logDir + '/error-%DATE%.log',
  frequency: 'daily',
  verbose: false
});

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 记录日志
app.use(logger('combined', {stream: accessLogStream}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//设置允许跨域访问
app.use(function (req, res, next) {
  if (req.method === "OPTIONS") {
    let headers = {};
    headers["Access-Control-Allow-Origin"] = "*";

    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";

    headers["Access-Control-Allow-Credentials"] = false;

    headers["Access-Control-Max-Age"] = '86400'; // 24 hours

    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";

    res.writeHead(200, headers);

    res.end();
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

  // 写入日志
  let des = req.ip + " " + (new Date()).toString() + " " + req.method + " " + req.path + " " + req.protocol + "/" + req.httpVersion + " " + res.statusCode + " " + req.headers["user-agent"] + " ";
  let errInfo = err.stack || err.message;
  des += errInfo;
  des += '/n';
  errLogStream.write(des);
  console.log(des);
});

module.exports = app;
