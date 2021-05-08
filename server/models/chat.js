const mongoose = require('mongoose')


const ChatSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    messages: [
        {
            
            body: {
                type:String,
            },
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref:'User'
            }
            
        }
    ]
},{timestamps: true})


module.exports = mongoose.model('Chat', ChatSchema);


