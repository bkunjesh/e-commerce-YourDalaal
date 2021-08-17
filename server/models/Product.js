const mongoose = require("mongoose");
const User = require('./user')


const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        // title: {
        //     type: String,
        //     default: 'n/a'
        // },
        category: {
            type: String,
            default: 'n/a'
        },
        images: [
            {
                url: String,
                filename:String
            }
        ],
        price: {
            type: Number,
            // default: '40000'
        },
        desc: {
            type: String,
            default: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam molestias numquam nulla blanditiis obcaecati itaque vero, eveniet similique nostrum suscipit."
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }

}, { timestamps: true })





module.exports = mongoose.model('Product', ProductSchema);