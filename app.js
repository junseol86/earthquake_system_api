var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var winston = require('./script/tool/winston.js');

var indexRouter = require('./routes/index');
var rt_load_str = require('./script/control/load_str_r.js');
var rt_member = require('./script/control/member_r.js');
var rt_chat = require('./script/control/chat_r.js');``
var rt_structure = require('./script/control/structure_r.js');
var rt_earthquake = require('./script/control/earthquake_r.js');
var rt_code = require('./script/control/code_r.js');
var rt_spot = require('./script/control/spot_r.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/load_str', rt_load_str);
app.use('/member', rt_member);
app.use('/chat', rt_chat);
app.use('/structure', rt_structure);
app.use('/earthquake', rt_earthquake);
app.use('/code', rt_code);
app.use('/spot', rt_spot);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  winston.errorLog('EXPRESS ERROR', err.stack);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
