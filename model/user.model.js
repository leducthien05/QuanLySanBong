const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    userName: String,
    email: String,
    phone: String,
    password: String,
    displayName: String,
    sex: String,
    status: {
        type: String,
        default: "active"
    },
    address: String,
    avatar: String,
    createdAt: Date, 
    updatedAt: Date,
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
const User = mongoose.model('User', userSchema, 'user');
module.exports = User;