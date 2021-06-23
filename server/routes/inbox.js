const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync=require('../utilities/catchAsync')

const {
    renderBasicInboxPage,
    renderInboxWithChat,
    sendMessage,
} = require("../controllers/inbox");



router.get("/", catchAsync(renderBasicInboxPage));

router.get("/:toUserId", catchAsync(renderInboxWithChat));

router.post("/sendMessage", catchAsync(sendMessage));


module.exports = router;