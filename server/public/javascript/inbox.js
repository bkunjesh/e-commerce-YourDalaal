var socket = io.connect();
const conversationlist = document.querySelector("#conversation-list");
const chat_list = document.querySelector("#chat-title");
const chat_message_list = document.querySelector("#chat-message-list");
const receiverID = document.querySelector("#receiverID").value;
const send_message = document.querySelector("#send_message");
const chatID = document.querySelector("#chatID").value;
const userID = document.querySelector("#userID").value;

connectSocket();
showActiveChat();
function connectSocket() {
    socket.emit("join", { id: userID });
}

if (send_message) {
    send_message.addEventListener("click", sendMessage);

    var input = document.querySelector("#message-text");

    input.addEventListener("keyup", (e) => {
        if (e.ctrlKey && e.keyCode === 13) {
            // console.log("ctrl+enter");
            e.preventDefault();
            var send_message = document.querySelector(`#send_message`);
            // console.log(send_message);
            
            send_message.click();
        }
    })

    // function onCntrEnterpress (e) {
    //     if (e.ctrlKey && e.keyCode === 13) {
    //         console.log("ctrl+enter");
    //         e.preventDefault();
    //         var send_message = document.querySelector(`#send_message`);
    //         console.log(send_message);
            
    //         send_message.click();
    //     }
    // }
    
    
    function sendMessage () {
        
        const message_text = document.querySelector("#message-text").value;
        // console.log("sendMessage clicked ",message_text);
        if (receiverID != "" && isvalidmessage(message_text)) {
            // let date=new Date();
            let data = {
                message_text: message_text,
                receiverID: receiverID,
                chatID: chatID,
            };

            axios
                .post(`/yourdalaal/inbox/sendMessage`, data, {
                    headers: { "Content-Type": "application/json" },
                })
                .then((res) => {
                    let date_ = new Date();
                    let { date, time } = getUpdatedDate(date_);
                    message_id = res.data.message_id;
                    // console.log(res.data);
                    checkForLatestDateUpdate(date);

                    chat_message_list.innerHTML += `
                        <div class="message-row you-message" data-message-id="${message_id}">
                            <div class="message-content">
                                <div class="message-text">${message_text}</div>
                                <div class="message-status">
                                        <div class="message-time">${time}</div>
                                        <div class="read-reciept"></div>
                                </div>
                            </div>
                        </div>    
                    `;
                    scrollDown();
                    // document.querySelector("#message-text").innerText = "";
                    document.querySelector("#message-text").value = "";

                    //updating recent message in conversation list
                            
                    conversations = document.querySelectorAll(".conversation");
                    var node;
                    conversations.forEach((element) => {
                        if (element.dataset.receiverId == receiverID) {
                            recentMessage = element.querySelector(
                                ".conversation-message"
                            );
                            messegeDate =
                                element.querySelector(".created-date");
                            node = element;
                            recentMessage.textContent = message_text;
                            messegeDate.textContent = date;
                        }
                    });
                    if (node) {
                        updateConversationList(node);
                    }
                })
                .catch((err) => {
                    console.log("error while sending message", err);
                });
        }
    }
}
// let input = document.querySelector(`[data-type]`);
// console.log(input);
socket.on("message", function (data) {
    //update chatlist 
    if (receiverID === data.senderId.toString()) {    

        checkForLatestDateUpdate(data.message_date);

        chat_message_list.innerHTML += `
            <div class="message-row other-message" data-message-id="${data.message_id}">
                <div class="message-content">
                    <img src=${data.profileImage} />
                    <div class="message-text">
                        ${data.message_text}
                    </div>
                    <div class="message-time">${data.message_time}</div>
                </div>
            </div>  
        `;

        readAcknowledge = {
            chatID: chatID,
            message_id: data.message_id,
            receiverID: receiverID,
        };
        
        socket.emit("readAcknowledge", readAcknowledge);
    }
    //update conversation list
    messageArrived(data);

    scrollDown();
});

//readAcknowledge for live users
socket.on("readAcknowledge", (data) => {
    let messages = document.querySelectorAll(`[data-message-id]`);
    
    messages.forEach((message) => {
        
        if (message.dataset.messageId.toString() == data.message_id.toString()) {
            let readReceipt = message
                .querySelector(".message-content")
                .querySelector(".message-status")
                .querySelector(".read-reciept");
            if (readReceipt) {
                readReceipt.innerHTML = "&#10003";
                playTickSound();
            }
        }
    });
});
//readAcknowledge for all unread previous message when recevier opened chat
//here we can get one by one readAcknowledgement for all unread message but it's costly operation that's why implemented 
//as one readAcknowledge for all unread message
socket.on("readAllAcknowledge", (data) => {
    if (chatID == data.chatID) {
        readReceipts = document.querySelectorAll(".read-reciept");
        for (let i = readReceipts.length - 1; i >= 0; i--) {
            if (chatID == data.chatID && readReceipts[i].innerHTML == "") {
                readReceipts[i].innerHTML = "&#10003";
                playTickSound();
            } else i = 0;
        }
    }
});

function checkForLatestDateUpdate(message_date) {
    chat_message_list_date = document.querySelectorAll(
        "#chat-message-list-date"
    );
    if (chat_message_list_date) {
        if (chat_message_list_date.length > 0)
            var lastChatDate =
                chat_message_list_date[chat_message_list_date.length - 1]
                    .childNodes[1];
        else lastChatDate = '';
    }
    if (!chat_message_list_date || lastChatDate.innerText != message_date) {
        chat_message_list.innerHTML += `
                <div id="chat-message-list-date">
                            <span>
                                ${message_date}
                            </span>
                </div>
                `;
    }
}

function messageArrived(data) {
    //finding node in conversation list for updation + reordering
    conversations = document.querySelectorAll(".conversation");
    var node;
    conversations.forEach((element) => {
        recentMessage = element.querySelector(".conversation-message");

        if (element.dataset.receiverId == data.senderId.toString()) {
            node = element;
            recentMessage.textContent = data.message_text;
            unread = element.querySelector(".unReadCount-message");
            if (unread && receiverID != data.senderId.toString()) {
                unread.textContent = parseInt(unread.textContent) + 1;
            } else if (receiverID != data.senderId.toString()) {
                element.innerHTML += `
                        <div class="unReadCount-message">1</div>
                    `;
            }
        }
    });
    if (node) {
        updateConversationList(node);
    } else {
        conversationlist.innerHTML =
            `
                <a href="/yourdalaal/inbox/${data.senderId}" data-receiver-id="${data.senderId}">
                    <div class="conversation" data-receiver-id="${data.senderId}">
                        <img src='${data.profileImage}'/>
                        <div class="title-text">${data.senderUsername}</div>
                        <div class="created-date">${data.message_date}</div>
                        <div class="conversation-message">
                            ${data.message_text}
                        </div>
                        <div class="unReadCount-message">1</div>
                    </div>
                    </a>
                ` + conversationlist.innerHTML;
    }
}

function updateConversationList(node) {
    //reordering the conversation list
    if (node) {
        node = node.parentNode;
        parent = node.parentNode;
        parent.removeChild(node);
        parent.insertBefore(node, parent.firstChild);
    }
}

socket.on("online", function (data) {
    if (data.connecteduser[receiverID]) {
        const online_status_text = document.querySelector(
            "#online-status-text"
        );
        if (online_status_text) {
            online_status_text.innerHTML = " &#128994 online";
        }
    }
    conversations = document.querySelectorAll(".conversation");
    var node;
    conversations.forEach((element) => {
        if (data.connecteduser[element.dataset.receiverId]) {
            titleText = element
                .querySelector(".title-text")
                .querySelector(".title-text-status");

            titleText.style.display = "inline";
        }
    });
    // console.log(data.connecteduser[receiverID]);
});
socket.on("offline", function (data) {
    if (!data.connecteduser[receiverID]) {
        const online_status_text = document.querySelector(
            "#online-status-text"
        );
        if (online_status_text) {
            online_status_text.innerHTML = "offline";
        }
    }
    conversations = document.querySelectorAll(".conversation");
    var node;
    conversations.forEach((element) => {
        if (!data.connecteduser[element.dataset.receiverId]) {
            titleText = element
                .querySelector(".title-text")
                .querySelector(".title-text-status");

            titleText.style.display = "none";
        }
    });
});

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
    time = getTime(date);
    date = isoFormatDMY(date);
    return { date, time };
}

scrollDown();
function scrollDown() {
    const chat_message_list = document.querySelector("#chat-message-list");
    chat_message_list.scrollTop = chat_message_list.scrollHeight;
}
function isvalidmessage(message_text) {
    if (message_text.length > 0)
        for (let ch of message_text) {
            if (ch != " ") return 1;
        }
    return 0;
}
function showActiveChat() {
    if (receiverID) {
        conversations = document.querySelectorAll(".conversation");
        conversations.forEach((element) => {
            if (element.dataset.receiverId == receiverID.toString()) {
                element.classList.add("active");
            }
        });
    }
}
function playTickSound() {
    // https://stackoverflow.com/questions/15483455/play-sound-when-message-received
    var audio = new Audio("/media/tick.mp3");
    audio.volume = 0.1;
    audio.play();
}

// <input type="textbox" data-emoji-input="unicode" class="form-control" id="message-text" placeholder="Input field"
//                             data-emojiable="true"></input>


// <input
//     type="textbox"
//     data-emoji-input="unicode"
//     class="form-control"
//     id="message-text"
//     placeholder="Input field"
// ></input>;


// <script>
//     $(function () {
//         // Initializes and creates emoji set from sprite sheet
//         window.emojiPicker = new EmojiPicker({
//             emojiable_selector: '[data-emojiable=true]',
//             assetsPath: '/emojipicker/lib/img/',
//             popupButtonClasses: 'fa fa-smile-o'
//         });
//         // Finds all elements with `emojiable_selector` and converts them to rich emoji input fields
//         // You may want to delay this step if you have dynamically created input fields that appear later in the loading process
//         // It can be called as many times as necessary; previously converted input fields will not be converted again
//         window.emojiPicker.discover();
//     });
// </script>