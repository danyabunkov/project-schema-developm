const createError = require('http-errors');
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const flash = require('connect-flash');

const indexRouter = require('./routes/index');
const resoursesRouter = require('./routes/resourses');
const aboutRouter = require('./routes/about');
const supportRouter = require('./routes/support');
const priceRouter = require('./routes/price');
const contactsRouter = require('./routes/contacts');




const app = express();
const hbs = exphbs.create({
  // // Specify helpers which are only registered on this instance.
  // helpers: {
  // }
});

const connection = require('./models/users');

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');

app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  key: 'user_sid',
  secret: 'anything here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use('/', indexRouter);
app.use('/resourses', resoursesRouter);
app.use('/about', aboutRouter);
app.use('/support', supportRouter);
app.use('/price', priceRouter);
app.use('/contacts', contactsRouter);







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
