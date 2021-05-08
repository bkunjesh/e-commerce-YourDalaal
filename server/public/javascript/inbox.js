var socket = io.connect();
const conversationlist=document.querySelector('#conversation-list');
const chat_list=document.querySelector('#chat-title');
const chat_message_list=document.querySelector('#chat-message-list');
const receiverID = document.querySelector('#receiverID').value;
const send_message = document.querySelector('#send_message');
var chatID;
var currentUser;

function conversationList()
{
    axios.get('/yourdalaal/inbox/getlist',{headers:{"Content-Type" : "application/json"}})
        .then((res) => {

            const { user } = res.data;
            console.log(user)
            currentUser = user;
            socket.emit('join', { id: user._id });

            user.inbox.sort(function (a, b) {
                return (a.updatedAt > b.updatedAt) ? -1 : ((a.updatedAt < b.updatedAt) ? 1 : 0);
            })

            for (let allChats of user.inbox)
            {
                const u1_id = allChats.user1._id.toString();
                const receiver = (u1_id === user._id.toString()) ? allChats.user2 : allChats.user1;

                var updatedDate = getUpdatedDate(allChats.updatedAt);
                if (allChats.messages.length > 0)
                    var recent_message = allChats.messages[allChats.messages.length - 1].body;
                else var recent_message = "";
                conversationlist.innerHTML +=
                    `<div style="{text-decoration: none}">
                        <a href="/yourdalaal/inbox/${receiver._id}" >
                            <div class="conversation">
                                <img src="https://img.icons8.com/metro/26/000000/user-male.png" alt="Kim O'Neil" />
                                <div class="title-text">${receiver.username}</div>
                                <div class="created-date">${updatedDate}</div>
                                <div class="conversation-message">
                                    ${recent_message}
                                </div>
                            </div>
                        </a>
                    </div>
                    `
                
                if (receiver._id.toString() === receiverID)
                {
                    chatID = allChats._id;
                    chat_list.innerHTML +=
                    `
                        <span>${receiver.username}</span>
                    `
                    const messagesize = (allChats.messages.length)
                    for (var i = Math.max(0, messagesize - 100); i < messagesize;i++)
                    {
                        const message = allChats.messages[i];
                        if (message.sender.toString() === receiver._id.toString())
                        {
                            chat_message_list.innerHTML +=
                            `
                                <div class="message-row other-message">
                                    <div class="message-content">
                                        <img src="https://img.icons8.com/metro/26/000000/user-male.png" alt="${receiver.username}" />
                                        <div class="message-text">
                                            ${message.body}
                                        </div>
                                        <div class="message-time"></div>
                                    </div>
                                </div>   
                            `
                        }
                        else
                        {
                            chat_message_list.innerHTML +=
                            `
                                <div class="message-row you-message">
                                    <div class="message-content">
                                        <div class="message-text">${message.body}</div>
                                        <div class="message-time"></div>
                                    </div>
                                </div>    
                            `
                        }
                    }
                    scrollDown();
                }
            }
        })
        .catch((err) => {
            console.log(err);
        })
}

conversationList();


if (send_message)
{
    send_message.addEventListener("click",async function () {
        const message_text = document.querySelector('#message-text').value;
        if (receiverID!=''&&isvalidmessage(message_text))
        {
            let data = { message_text: message_text, receiverID: receiverID, chatID:chatID };
            
            axios.post(`/yourdalaal/inbox/sendMessage`,data,{headers:{"Content-Type" : "application/json"}})
            .then((res) => {
                
                chat_message_list.innerHTML +=
                `
                    <div class="message-row you-message">
                        <div class="message-content">
                            <div class="message-text">${message_text}</div>
                            <div class="message-time"></div>
                        </div>
                    </div>    
                `
                scrollDown();
                document.querySelector('#message-text').value = '';
            })
            .catch((err)=>{
                console.log(err);
            })
            
        }
    });
}


socket.on('message', function (data) {
    if (receiverID === data.senderID.toString()) {
        chat_message_list.innerHTML +=
            `
                <div class="message-row other-message">
                    <div class="message-content">
                        <img src="https://img.icons8.com/metro/26/000000/user-male.png" />
                        <div class="message-text">
                            ${data.message_text}
                        </div>
                        <div class="message-time"></div>
                    </div>
                </div>  
            `
    }
    scrollDown();
})
            
            
function scrollDown() {
    chat_message_list.scrollTop = chat_message_list.scrollHeight;
}
function isvalidmessage(message_text)
{
    if(message_text.length>0)
    for (let ch of message_text)
    {
        if (ch != ' ') return 1;
    }
    return 0;
}

function getUpdatedDate(date)
{
    //https://stackoverflow.com/questions/27012854/change-iso-date-string-to-date-object-javascript

    function parseISOString(s) {
        var b = s.split(/\D+/);
        return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
    }

    function isoFormatDMY(d) {  
        function pad(n) {return (n<10? '0' :  '') + n}
        return pad(d.getUTCDate()) + '/' + pad(d.getUTCMonth() + 1) + '/' + d.getUTCFullYear();
    }

    date_ = parseISOString(date);
    return isoFormatDMY(date_);
}


