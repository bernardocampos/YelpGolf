const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utilities/catchAsync')
const ExpressError = require('../utilities/ExpressError')
const Review = require('../models/review');
const Course = require('../models/course');
const { reviewSchema } = require('../schemas.js')

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

router.get('/new', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const course = await Course.findById(id);
    res.render('reviews/new', { course })
}));

router.post('/', validateReview, catchAsync(async (req, res) => {
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

router.delete('/:reviewId', catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Course.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/courses/${id}`)

}));

module.exports = router;