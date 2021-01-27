let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
const WebSocket = require('ws'); // new

let indexRouter = require('./routes/index');

let session = require('client-sessions');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  cookieName: 'session',
  secret: 'iCantBelieveThatTheAnsweris42',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

//Import the mongoose module
let mongoose = require('mongoose');

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
mongoose.connect(mongoDB,
    {useNewUrlParser: true,
      useUnifiedTopology: true});

//Get the default connection
let db = mongoose.connection;

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

module.exports = app;
