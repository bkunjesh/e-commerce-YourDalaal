const mongoose = require('mongoose')
const Product = require('./Product')
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    contact: {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            // min: 10,
            // max:10
        },
    },
    college: {
        name: {
            type: String,
        },
        address: {
            city: {
                type: String,
            },
            state: {
                type: String,
            },
        },
        required: false,
    },
    profileImage: {
        url: {
            type: String,
            default: "https://img.icons8.com/metro/26/000000/user-male.png",
        },
        filename: {
            type: String,
            default:"",
        },
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
    ],
    inbox: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
        },
    ],
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);