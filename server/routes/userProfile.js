const express = require('express');
const Product = require('../models/Product')
const User = require('../models/user')
const catchAsync=require('../utilities/catchAsync')
const ExpressError=require('../utilities/ExpressError')
const { isLoggedIn,isAuthor }=require('../middleware/middleware');

const router = express.Router({mergeParams:true});


router.get('/:username', catchAsync(async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username: username }).populate('products');
    
    // console.log(req.user)
    // console.log(user._id);
    // console.log(user.products.length);
    // for (let product of user.products)
    // {
    //     console.log(product.name+":"+product.owner);
        
    // }

    res.render('profile/userProfile', { user });
}))

module.exports = router;