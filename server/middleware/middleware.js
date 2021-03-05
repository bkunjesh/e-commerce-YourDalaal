const Product = require('../models/Product')
const User = require('../models/user')
const catchAsync=require('../utilities/catchAsync')
const ExpressError=require('../utilities/ExpressError')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo=req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product.owner.equals(req.user._id)) {
        req.flash('error', 'you do not have permission to do that!');
        return res.redirect(`/yourdalaal/${productId}`);
    }
    next();
}