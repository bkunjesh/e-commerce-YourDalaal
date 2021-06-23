const Chat = require("../models/chat");
const User = require("../models/user");
const {
    getUpdatedDate,
    get_ConversationList_conversation,
} = require("../middleware/inbox");



module.exports.renderBasicInboxPage =async (req, res) => {
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
}

module.exports.renderInboxWithChat = async (req, res) => {
    const receiverID = req.params.toUserId;
    // checking validity of receiverID
    try {
        await User.findById(receiverID);
    } catch {
        req.flash("error", "requested user is not found.");
        res.redirect("/yourdalaal/inbox");
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
        req.io.sockets.in(receiverID).emit("readAllAcknowledge",{chatID});

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
};

module.exports.sendMessage = async (req, res) => {
    const { message_text, receiverID, chatID } = req.body;
    let Curdate = new Date();
    const msg = {
        body: message_text,
        sender: req.user._id,
        time: Curdate,
        isRead: 0,
    };

    let chat = await Chat.findById(chatID);
    chat.messages.push(msg);
    await chat.save();

    let profileImage = req.user.profileImage.url
        ? req.user.profileImage.url
        : "https:img.icons8.com/metro/26/000000/user-male.png";

    const { date , time } = getUpdatedDate(chat.messages[chat.messages.length - 1].time);
    
    let message = {
        message_id: chat.messages[chat.messages.length - 1]._id,
        message_text: message_text,
        senderId: req.user._id,
        senderUsername: req.user.username,
        message_class: "other-message",
        profileImage: profileImage,
        message_date: date,
        message_time: time,
    };
    req.io.sockets.in(receiverID).emit("message", message);
    res.send(message);
};