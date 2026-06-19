const mongoose = require('mongoose');
const crypto = require("crypto");

const accountSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    email: String,
    password: String,
    displayName: String,
    token: {
        type: String,
        default: () => crypto.randomBytes(32).toString("hex")
    },
    role_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    },
    avatar: String,
    address: String,
    status: {
        type: String,
        default: 'active'
    },
    deleted: {
        type: Boolean,
        default: false
    }
});
const Account = mongoose.model('Account', accountSchema, 'account');
module.exports = Account;