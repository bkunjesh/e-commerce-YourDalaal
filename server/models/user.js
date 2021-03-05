const mongoose = require('mongoose')
const Product = require('./Product')
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    contact: {
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: String,
            // min: 10,
            // max:10
        }
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
            }
        },
        required: false,
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }
    ]
})

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);