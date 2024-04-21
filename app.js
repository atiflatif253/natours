const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app= express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//   1) Global Middlewares
// serving statics files
app.use(express.static(path.join(__dirname, 'views')));

// Set security HTTP headers
app.use(helmet())

console.log(process.env.NODE_ENV);
//  DEVELOPMENT LOGGING
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
else{
    app.use(morgan('prod'))
}
// Limit request from same API
const limiter = rateLimit ({
    max:100,
    windowMs: 60*60*1000,
    message: 'To many requests form this IP, please try again in an hour!'
});
app.use('/api', limiter)

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data Sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: ['duration', 'ratingQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

// app.use((req, res, next)=>{
//  console.log('Hello from the middleware'); 
//  next();
// });

// Test middleware
app.use((req, res, next) => {
    req.reqTime = new Date().toISOString();
    // console.log(req.headers);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.status(200).render('base')
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
    });

app.use(globalErrorHandler);

module.exports = app;