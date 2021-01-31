const debug = require('debug')('thitime:server');
const http = require('http');

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const session = require('client-sessions');
const favicon = require('serve-favicon');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public') , {
  maxAge: '3600000' //1 hour
}));
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(session({
  cookieName: 'session',
  secret: 'iCantBelieveThatTheAnsweris42',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

//Import the mongoose module
const mongoose = require('mongoose');

let mongoDB = 'mongodb://127.0.0.1/thiTime';
if (process.env.NODE_ENV === "development") {
  console.log('running in dev');
}
else if (process.env.NODE_ENV === "production") {
  console.log('running in prod');
  const config = JSON.parse(process.env.APP_CONFIG);
  mongoDB = 'mongodb://' + config.mongo.user + ':' + encodeURIComponent(process.env.dbpw)
      + '@' + config.mongo.hostString + '/thiTime';
}
else {
  console.log('process.env.NODE_ENV:'+process.env.NODE_ENV);
}

//console.log('mongoDb:'+mongoDB);
//Set up default mongoose connection
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true});

//Get the default connection
const db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use('/', indexRouter);

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
});


const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);


const server = http.createServer(app);
const ws = require('./websocket');
const wss =ws.newServer(server);

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
