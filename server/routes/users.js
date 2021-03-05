const express = require('express');
const Product = require('../models/Product')
const catchAsync=require('../utilities/catchAsync')
const ExpressError=require('../utilities/ExpressError')
const User = require('../models/user')
const passport = require('passport');

const router = express.Router({mergeParams:true});


router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { contact, username, password,college, address } = req.body;
        
        const user = new User({ username, contact, college });
        user.college.address = address;
        
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yourdalaal');
            res.redirect('/yourdalaal');
        })
    } catch (e) { 
        req.flash('error', e.message);
        res.redirect('register');
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome to YourDalaal');
    const redirectUrl = req.session.returnTo || '/yourdalaal';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
    
})
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Loged out!')
    res.redirect('/yourdalaal');
})


module.exports = router;