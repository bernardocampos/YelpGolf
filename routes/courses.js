const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync')
const ExpressError = require('../utilities/ExpressError')
const Course = require('../models/course');
const { courseSchema } = require('../schemas.js')


const validateCourse = (req, res, next) => {

    const { error } = courseSchema.validate(req.body)
    
    if (error) {
        console.log(error);
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res, next) => {
    const courses = await Course.find({});
    res.render('courses/index', { courses })
}));

router.get('/new', catchAsync(async (req, res, next) => {
    res.render('courses/new')
}));

router.post('/', validateCourse, catchAsync(async (req, res, next) => {
    
    const newCourse = new Course(req.body.course)
    await newCourse.save();
    req.flash('success', 'New course was created successfully.');
    res.redirect(`/courses/${newCourse._id}`)
}));

router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const course = await Course.findById(id).populate('reviews');
    if (!course) {
        req.flash('error', 'Cannot find that course.');
        res.redirect('/courses');
        // throw next(new ExpressError('Course not found', 404)); //this was the initial approach
    }
    res.render('courses/show', { course })
}));

router.get('/:id/edit', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
        throw next(new ExpressError('Unable to edit. Course not found', 404));
    }
    res.render('courses/edit', { course })
}));

router.put('/:id', validateCourse, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(id,
        req.body.course, //what's the difference between this and {...req.body.course} ?
        { runValidators: true })
    req.flash('success', 'Course updated successfully.');
    res.redirect(`/courses/${course._id}`)
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    req.flash('success', 'Course deleted successfully.');
    res.redirect(`/courses`)
}));

module.exports = router;