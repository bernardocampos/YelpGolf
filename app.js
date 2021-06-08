const express = require('express');
const app = express();
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);
const path = require('path');
const methodOverride = require('method-override');
const Course = require('./models/course');
const Review = require('./models/review');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError')
const catchAsync = require('./utilities/catchAsync')

const courses = require('./routes/courses');
const reviews = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-golf', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected')
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))


app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'esdrft7678u990jionjbnkokp[oi6r76]',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/courses', courses)
app.use('/courses/:id/reviews', reviews)


app.get('/', (req, res) => {
    res.render('home.ejs');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found.', 404))
})

const handleValidationErr = err => {
    console.dir(err);
    return new ExpressError(`${err.message}`, 400)
}

app.use((err, req, res, next) => {
    console.log(err.name);
    if (err.name === 'ValidationError') err = handleValidationErr(err);
    next(err)
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Something went wrong.';
    res.status(status).render('error', { err });
})

app.listen(3000, () => {
    console.log('serving on port 3000')
})