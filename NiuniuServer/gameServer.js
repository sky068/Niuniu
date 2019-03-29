#!/usr/bin/env node

var debug = require('debug')('niuniuserver:server');
var http = require('http');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let fs = require('fs');
let fileStreamRotator = require('file-stream-rotator');
let game = require('./game/game').getInstance();

// 记录日志到文件
let logDir = __dirname + '/logs_socket';
fs.existsSync(logDir) || fs.mkdirSync(logDir);
let errLogStream = fileStreamRotator.getStream({
  filename: logDir + '/error-%DATE%.log',
  frequency: 'daily',
  verbose: false
});
let accessLogStream = fileStreamRotator.getStream({
  filename: logDir + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
});

let app = express();
app.use(logger('combined', {stream: accessLogStream}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '3005');
app.set('port', port);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  let des = "error: " + error.code + " ";
  let errInfo = err.stack || err.message;
  des += errInfo;
  des += '/n';
  errLogStream.write(des);
  
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

let ws = require('express-ws')(app, server);
app.ws('/ws', (socket, req)=>{
  console.log('open socket.');
  game.dealUserOnline(socket);
  socket.on('message', (msg)=>{
    game.handleMsg(socket, msg);
  });

  socket.on('error', (err)=>{
    console.log("error: " + err);
  });

  socket.on('close', ()=>{
    console.log('close.');
    game.dealOffline(socket);
  });
});

console.log('start socket server, port: ' + port);

