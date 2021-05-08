const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync=require('../utilities/catchAsync')
const Chat = require('../models/chat');
const User = require('../models/user');
var io;

router.use((req, res,next) => {
    io = req.io;
    next();
})

router.get('/', catchAsync(async (req, res) => {
    
    res.render('inbox/inbox.ejs', { receiverID: ''});
}))


router.get('/getlist',catchAsync(async (req, res) => {
    
    const user = await User.findById(req.user._id).populate({
        path: 'inbox',
        populate: {
            path: 'user2',
        }
    }).populate({
        path: 'inbox',
        populate: {
            path: 'user1',
        }
    });
    res.send({ user });
}))

router.get('/:toUserId', catchAsync(async (req, res) => {
    const receiverID = req.params.toUserId;
    //checking validity of receiverID
    try {
        await User.findById(receiverID);
    }
    catch {
        req.flash('error', 'requested user is not found.')
        res.redirect('/yourdalaal/inbox');
    }

    //chat is present or not
    var u1 = receiverID.toString();
    var u2 = req.user._id.toString();

    if (u1 === u2)
    {
        //if receiver and sender is same => error
        req.flash('error', 'invalid request.')
        res.redirect('/yourdalaal/inbox');
    }
    else {
        var chat = await Chat.findOne({ user1: u1, user2: u2 })
        if (!chat) chat = await Chat.findOne({ user1: u2, user2: u1 })

        //if chat is not their
        if (!chat) {
            chat = new Chat({ user1: u1, user2: u2 });
            await chat.save();
            const user1 = await User.findById(u1);
            const user2 = await User.findById(u2);
            user1.inbox.push(chat);
            user2.inbox.push(chat);
            await user1.save();
            await user2.save();
        }
        
        res.render('inbox/inbox.ejs', { receiverID });
    }
    
}))

router.post('/sendMessage', catchAsync(async (req, res) => {
    const { message_text, receiverID, chatID}=req.body;

    const msg = {
        body: message_text,
        sender: req.user._id
    }

    await Chat.findByIdAndUpdate({ _id: chatID }, { $push: { messages: msg } });

    var send = { message_text: message_text, receiverID: receiverID, chatID: chatID, senderID: req.user._id };
    io.sockets.in(receiverID).emit('message', send);
    

    res.status(204).send();
}))

module.exports = router;
