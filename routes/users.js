const express = require('express')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utilities/catchAsync')
const passport = require('passport')

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        console.log(registeredUser)
        req.flash('success', 'welcome to yelpcamp!')
        res.redirect('/courses')
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('register')
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), catchAsync(async (req, res) => {
    req.flash('success', 'Welcome to YelpGolf');
    res.redirect('/courses');
}));



module.exports = router;