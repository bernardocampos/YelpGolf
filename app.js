const express = require('express');
const app = express();
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);
const path = require('path');
const methodOverride = require('method-override');
const Course = require('./models/course');
const Review = require('./models/review');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utilities/ExpressError')
const catchAsync = require('./utilities/catchAsync')

const { courseSchema, reviewSchema } = require('./schemas.js')

mongoose.connect('mongodb://localhost:27017/yelp-golf', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
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


const validateCourse = (req, res, next) => {

    const { error } = courseSchema.validate(req.body)
    console.log(error);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body)
    console.log(error);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home.ejs');
})

app.get('/courses', catchAsync(async (req, res, next) => {

    const courses = await Course.find({});
    res.render('courses/index', { courses })


}));

app.get('/courses/new', catchAsync(async (req, res, next) => {

    res.render('courses/new')

}));

app.post('/courses', validateCourse, catchAsync(async (req, res, next) => {


    const newCourse = new Course(req.body.course)
    await newCourse.save();
    res.redirect(`/courses/${newCourse._id}`)


}));

app.get('/courses/:id', catchAsync(async (req, res, next) => {

    const { id } = req.params;
    const course = await Course.findById(id).populate('reviews');
    if (!course) {
        throw next(new ExpressError('Course not found', 404));
    }
    res.render('courses/show', { course })
}));

app.get('/courses/:id/edit', catchAsync(async (req, res, next) => {

    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
        throw next(new ExpressError('Unable to edit. Course not found', 404));
    }
    res.render('courses/edit', { course })


}));

app.put('/courses/:id', validateCourse, catchAsync(async (req, res, next) => {

    const { id } = req.params;

    const course = await Course.findByIdAndUpdate(id,
        req.body.course, //what's the difference between this and {...req.body.course} ?
        { runValidators: true })

    res.redirect(`/courses/${course._id}`)

}));

app.delete('/courses/:id', catchAsync(async (req, res) => {

    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    res.redirect(`/courses`)

}));

app.get('/courses/:id/reviews/new', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const course = await Course.findById(id);
    res.render('reviews/new', { course })
}));

app.post('/courses/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const review = new Review(req.body.review);
    const course = await Course.findById(id).populate('reviews');
    if (!course) {
        throw next(new ExpressError('Course not found', 404));
    }
    course.reviews.push(review);
    await course.save();
    await review.save();

    res.redirect(`/courses/${course._id}`)
}));

app.delete('/courses/:id/reviews/:reviewId', catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Course.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/courses/${id}`)

}));

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