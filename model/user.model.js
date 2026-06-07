const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    userName: String,
    email: String,
    phone: String,
    password: String,
    status: {
        type: String,
        default: "active"
    },
    avatar: String,
    createdAt: Date, 
    updatedAt: Date,
    deleted: {
        type: Boolean,
        default: false
    }
});
const User = mongoose.model('User', userSchema, 'user');
module.exports = User;