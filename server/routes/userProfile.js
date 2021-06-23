const express = require('express');
const Product = require('../models/Product')
const catchAsync=require('../utilities/catchAsync')

const router = express.Router({mergeParams:true});
const { renderUserProfile } = require('../controllers/userProfile');

router.get("/:username", catchAsync(renderUserProfile));

module.exports = router;