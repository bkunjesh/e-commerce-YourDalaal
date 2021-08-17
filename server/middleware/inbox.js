
module.exports.get_ConversationList_conversation= (user, receiverID)=> {
    user.inbox.sort(function (a, b) {
        if (a.messages.length == 0 || b.messages.length == 0) return 0;
        return a.messages[a.messages.length-1].time > b.messages[b.messages.length-1].time ? -1 : a.messages[a.messages.length-1].time < b.messages[b.messages.length-1].time ? 1 : 0;
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
        return receiver.profileImage.url
            ? receiver.profileImage.url
            : "https:img.icons8.com/metro/26/000000/user-male.png";
    }

    function getUnreadMessagesCount(receiver, chat) {
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
        const unReadCount = getUnreadMessagesCount(receiver, chat);
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
        return messageObj.sender._id.toString() == receiver._id.toString()
            ? "other-message"
            : "you-message";
    }
    function getIsMessageRead(messageObj, message_class) {
        
        return (message_class == "you-message" && messageObj.isRead) ? 1 : 0;
    }
    function getConversation(receiver, chat) {
        chat.messages.forEach((messageObj) => {
            let message_class = getMessageClass(receiver, messageObj);
            let { date = "", time = "" } = getUpdatedDate(messageObj.time);
            let isRead = getIsMessageRead(messageObj, message_class);
            let message = {
                message_id: messageObj._id,
                message_text: messageObj.body,
                sender: messageObj.sender,
                message_class: message_class,
                isRead: isRead,
                message_date: date,
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

getUpdatedDate = (date) => {
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
    if (!date) {
        time = "";
        date = "";
        return { date, time };
    }
    time = getTime(date);
    date = isoFormatDMY(date);
    return { date, time };
}

module.exports.readAcknowledge = async (readAcknowledge) => {
    var chat = await Chat.findById({ _id: readAcknowledge.chatID });
    chat.messages[chat.messages.length - 1].isRead = 1;
    await chat.save();

    return;
};


module.exports.getUpdatedDate = getUpdatedDate;
