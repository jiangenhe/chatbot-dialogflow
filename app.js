var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(cors());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

var server = app.listen(8001, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("App listening at http://%s:%s", host, port)
})

// process.on('SIGTERM', shutDown);
// process.on('SIGINT', shutDown);
//
// let connections = [];
//
// server.on('connection', connection => {
//   connections.push(connection);
//   connection.on('close', () => connections = connections.filter(curr => curr !== connection));
// });
//
// function shutDown() {
//   console.log('Received kill signal, shutting down gracefully');
//   server.close(() => {
//     console.log('Closed out remaining connections');
//     process.exit(0);
//   });
//
//   setTimeout(() => {
//     console.error('Could not close connections in time, forcefully shutting down');
//     process.exit(1);
//   }, 10000);
//
//   connections.forEach(curr => curr.end());
//   setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
// }
//
// module.exports = app;