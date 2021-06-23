const express = require('express');
const catchAsync=require('../utilities/catchAsync')
const ExpressError=require('../utilities/ExpressError')
const { isLoggedIn, isAuthor } = require('../middleware/middleware');
const multer = require('multer');
const { storage } = require('../cloudinary/index.js');
const upload = multer({storage:storage});
const router = express.Router({mergeParams:true});

const {
    showAllProducts,
    sellNewProductForm,
    showProduct,
    editProduct,
    createNewProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/yourdalaal");

router.route('/')
    .get(catchAsync(showAllProducts))
    .post(isLoggedIn, upload.array('image'), catchAsync(createNewProduct))


router.get('/new',isLoggedIn,sellNewProductForm)

router.route('/:productId')
    .get(catchAsync(showProduct))
    .put(isLoggedIn, isAuthor, upload.array('image'), catchAsync(updateProduct))
    .delete(isLoggedIn,isAuthor, catchAsync(deleteProduct))

    
router.get('/:productId/edit',isLoggedIn, isAuthor, catchAsync(editProduct))









module.exports = router;
