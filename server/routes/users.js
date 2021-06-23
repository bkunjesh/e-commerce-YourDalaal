const express = require('express');
const catchAsync=require('../utilities/catchAsync')
const passport = require('passport');
const multer = require('multer');
const { storage } = require('../cloudinary/index.js');
// const upload=multer({dest:'uploads/'}) 
const upload = multer({storage:storage});
const router = express.Router({ mergeParams: true });

const {
    renderRegisterForm,
    registerNewUser,
    renderLoginForm,
    loginUser,
    logoutUser,
} = require("../controllers/users");


router.route('/register')
    .get(renderRegisterForm)
    .post(upload.single("image"), catchAsync(registerNewUser))

router.route('/login')
    .get(renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), loginUser)

router.get('/logout', logoutUser)


module.exports = router;
