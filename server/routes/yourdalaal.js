const express = require('express');
const Product = require('../models/Product')
const User = require('../models/user')
const catchAsync=require('../utilities/catchAsync')
const ExpressError=require('../utilities/ExpressError')
const { isLoggedIn,isAuthor }=require('../middleware/middleware');

const router = express.Router({mergeParams:true});




router.get('/', catchAsync(async (req, res) => {
    const products =await Product.find({});
    // console.log(products);
    
    res.render('yourdalaal/index',{products})
}))



router.get('/new',isLoggedIn, (req, res) => {
    res.render('yourdalaal/new')
})



router.get('/:productId', catchAsync(async (req, res) => {
    
    const product = await Product.findById(req.params.productId).populate('owner');
    // console.log(product)
    
    if (!product)
    {
        req.flash('error', 'cant find product.');
        return res.redirect('/yourdalaal');
    }
    res.render('yourdalaal/show',{product});
}))



router.get('/:productId/edit',isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.productId)
    console.log(product);
    if (!product)
    {
        req.flash('error', 'cant find product.');
        return res.redirect('/yourdalaal');
    }
    res.render('yourdalaal/edit',{product});
}))



router.post('/',isLoggedIn, catchAsync(async (req, res) => {
    
    const user = await User.findById(req.user._id);
    
    const product = new Product(req.body);
    product.owner = user
    user.products.push(product)
    
    await product.save();
    await user.save();
    
    req.flash('success', 'new product created.');
    res.redirect(`/yourdalaal/${product._id}`);
}))



router.put('/:productId',isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    await Product.findByIdAndUpdate(req.params.productId, { ...req.body })
    req.flash('success', 'product successfuly updated.');
    res.redirect(`/yourdalaal/${req.params.productId}`)
}))



router.delete('/:productId',isLoggedIn,isAuthor, catchAsync(async (req, res) => {
    const { productId } = req.params
    
    await User.findByIdAndUpdate(req.user._id, { $pull: { products: productId } });    
    
    await Product.findByIdAndDelete(req.params.productId)
    
    req.flash('success', 'product deleted.');
    res.redirect('/yourdalaal')
    
}))



module.exports = router;