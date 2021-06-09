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
    const receiverID = "";
    const chatID = "";
    const userID = req.user._id;
    const user = await User.findById(req.user._id)
        .populate({
            path: "inbox",
            populate: {
                path: "user2",
            },
        })
        .populate({
            path: "inbox",
            populate: {
                path: "user1",
            },
        });
    const { conversationList, conversation, Receiver } =
        await get_ConversationList_conversation(user, receiverID);

    // console.log(receiver);
    // conversationList.forEach((item) => console.log(item));
    // conversation.forEach((item) => console.log(item));

    res.render("inbox/inbox.ejs", {
        receiverID,
        chatID,
        userID,
        conversationList,
        conversation,
        receiver: Receiver,
    });
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
    // checking validity of receiverID
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

    if (u1 === u2) {
        //if receiver and sender is same => error
        req.flash("error", "invalid request.");
        res.redirect("/yourdalaal/inbox");
    } else {
        var chat = await Chat.findOne({ user1: u1, user2: u2 });
        if (!chat) chat = await Chat.findOne({ user1: u2, user2: u1 });

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
        const chatID = chat._id;
        for (let i = chat.messages.length - 1; i >= 0; i--) {
            if (chat.messages[i].sender.toString() != req.user._id.toString()) {
                // console.log(req.user._id,chat.messages[i],chat.messages[i].isRead);
                if (chat.messages[i].isRead == 0) {
                    chat.messages[i].isRead = 1;
                    // console.log(chat.messages[i]);
                } else {
                    i = 0;
                }
            }
        }
        await chat.save();
        
        const userID = req.user._id;
        const user = await User.findById(req.user._id)
            .populate({
                path: "inbox",
                populate: {
                    path: "user2",
                },
            })
            .populate({
                path: "inbox",
                populate: {
                    path: "user1",
                },
            });

        const { conversationList, conversation, Receiver } =
            await get_ConversationList_conversation(user, receiverID);
        
        // console.log(receiver);
        // conversationList.forEach((item) => console.log(item));
        // conversation.forEach((item) => console.log(item));

        res.render("inbox/inbox.ejs", {
            receiverID,
            chatID,
            userID,
            conversationList,
            conversation,
            receiver: Receiver,
        });
    }
    
}))


function get_ConversationList_conversation(user, receiverID) {

    user.inbox.sort(function (a, b) {
                        return (a.updatedAt > b.updatedAt) ? -1 : ((a.updatedAt < b.updatedAt) ? 1 : 0);
                    })
    let conversationList = [];
    let conversation = [];
    let Receiver;
    function getReceiver(chat) {
        const u1_id = chat.user1._id.toString();
        return u1_id === user._id.toString() ? chat.user2 : chat.user1;
    }
    function getRecentMessage(chat) {
        return chat.messages.length > 0
            ? chat.messages[chat.messages.length - 1].body
            : "";
    }
    function getProfileImage(receiver) {
        return (receiver.profileImage.url) ? receiver.profileImage.url : 'https:img.icons8.com/metro/26/000000/user-male.png';
    }
    
    function getUnreadMessagesCount(receiver,chat) {
        let unReadCount = 0;
        for (let i = chat.messages.length - 1; i >= 0; i--) {
            if (chat.messages[i].sender.toString() != user._id.toString()) {
                // console.log(req.user._id,chat.messages[i],chat.messages[i].isRead);
                if (chat.messages[i].isRead == 0) {
                    unReadCount++;
                    // console.log(chat.messages[i]);
                } else {
                    i = 0;
                }
            }
        }
        return unReadCount;
    }

    function getConversationListItem(receiver, chat) {
        // const UpdatedAt = "date";
        const { date } = getUpdatedDate(chat.updatedAt);
        const recent_message = getRecentMessage(chat);
        const profileImage = getProfileImage(receiver);
        const unReadCount = getUnreadMessagesCount(receiver,chat);
        let conversationListItem = {
            receiverName: receiver.username,
            receiverId: receiver._id,
            profileImage: profileImage,
            updatedAt: date,
            recent_message: recent_message,
            unReadCount: unReadCount,
        };
        return conversationListItem;
    }
    function getMessageClass(receiver, messageObj) {
        return (messageObj.sender._id.toString() == receiver._id.toString())? "other-message": "you-message";
    }
    
    function getConversation(receiver, chat) {
        chat.messages.forEach((messageObj) => {
            let message_class = getMessageClass(receiver, messageObj);
            let { date="", time="" } = getUpdatedDate(messageObj.time);
            let message = {
                message_text: messageObj.body,
                sender: messageObj.sender,
                message_class: message_class,
                isRead: messageObj.isRead,
                message_date:date,
                message_time: time,
            };
            conversation.push(message);
        });
    }

    user.inbox.forEach((chat, index) => {
        const receiver = getReceiver(chat);
        if (receiver._id == receiverID) {
            getConversation(receiver, chat);
            Receiver = receiver;
        }
        let conversationListItem = getConversationListItem(receiver, chat);
        conversationList.push(conversationListItem);
    });

    
    return { conversationList, conversation, Receiver };
}

function getUpdatedDate(date) {
    //https://stackoverflow.com/questions/27012854/change-iso-date-string-to-date-object-javascript
    function isoFormatDMY(d) {
        function pad(n) {
            return (n < 10 ? "0" : "") + n;
        }
        return (
            pad(d.getDate()) +
            "/" +
            pad(d.getMonth() + 1) +
            "/" +
            d.getFullYear()
        );
    }
    function getTime(date) {
        let time = date.toLocaleTimeString("en-US");
        var b = time.split(":");
        var c = b[2].split(" ");
        return b[0] + ":" + b[1] + ":" + c[1];
    }
    if (!date)
    {
        time = "";
        date = "";
        return { date, time };
    }
    time = getTime(date);
    date = isoFormatDMY(date);
    return { date, time };
}

router.post('/sendMessage', catchAsync(async (req, res) => {
    const { message_text, receiverID, chatID } = req.body;
    let date = (new Date());
    const msg = {
        body: message_text,
        sender: req.user._id,
        time: date,
        isRead: 0,
    };
    
    let chat = await Chat.findByIdAndUpdate({ _id: chatID }, { $push: { messages: msg } });
    await chat.save();
    let profileImage = (req.user.profileImage.url) ? req.user.profileImage.url : 'https:img.icons8.com/metro/26/000000/user-male.png';
    
    const { date_ = "", time = "" } = getUpdatedDate(date);
    let message = {
        message_text: message_text,
        senderId: req.user._id,
        senderUsername: req.user.username,
        message_class: "other-message",
        profileImage: profileImage,
        message_date: date_,
        message_time: time,
    };
    io.sockets.in(receiverID).emit("message", message);
    
    res.status(204).send();
}))


module.exports = router;
