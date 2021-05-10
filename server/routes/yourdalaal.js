const express = require('express');
const Product = require('../models/Product')
const User = require('../models/user')
const catchAsync=require('../utilities/catchAsync')
const ExpressError=require('../utilities/ExpressError')
const { isLoggedIn, isAuthor } = require('../middleware/middleware');
const multer = require('multer');
const { storage } = require('../cloudinary/index.js');
// const upload=multer({dest:'uploads/'}) 
const upload = multer({storage:storage});
const { cloudinary }=require("../cloudinary/index")
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
    if (!product)
    {
        req.flash('error', 'cant find product.');
        return res.redirect('/yourdalaal');
    }
    res.render('yourdalaal/show',{product});
}))



router.get('/:productId/edit',isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.productId)
    if (!product)
    {
        req.flash('error', 'cant find product.');
        return res.redirect('/yourdalaal');
    }
    res.render('yourdalaal/edit',{product});
}))


router.post('/',isLoggedIn, upload.array('image'), catchAsync(async (req, res) => {
    
    const user = await User.findById(req.user._id);

    const product = new Product(req.body);
    product.owner = user;
    product.description.images = req.files.map(f => ({ url: f.path, filename: f.filename }));


    user.products.push(product)
    
    await product.save();
    await user.save();
    
    req.flash('success', 'new product created.');
    res.redirect(`/yourdalaal/${product._id}`);
}))

router.put('/:productId', isLoggedIn, isAuthor, upload.array('image'), catchAsync(async (req, res) => {

    const more_img = req.files.map(f => ({ url: f.path, filename: f.filename }));

    const product = await Product.findByIdAndUpdate(req.params.productId, {
        name: req.body.name,
        "description.category": req.body.description.category,
        "description.price": req.body.description.price,
        "description.desc": req.body.description.desc,
        $push: {
            "description.images": {
                $each:more_img
            }
        },
    });

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages)
        {
            await cloudinary.uploader.destroy(filename);
        }
        await product.updateOne({
            $pull: {
                "description.images": {
                    filename: {
                        $in: req.body.deleteImages
                    }
                }
            }
        });
    }

    req.flash('success', 'product successfuly updated.');
    res.redirect(`/yourdalaal/${req.params.productId}`);
}))



router.delete('/:productId',isLoggedIn,isAuthor, catchAsync(async (req, res) => {
    const { productId } = req.params
    
    await User.findByIdAndUpdate(req.user._id, { $pull: { products: productId } });    
    
    var product = await Product.findByIdAndDelete(req.params.productId)
    for (let img of product.description.images)
    {
        await cloudinary.uploader.destroy(img.filename);
    }
    
    req.flash('success', 'product deleted.');
    res.redirect('/yourdalaal')
    
}))



module.exports = router;
