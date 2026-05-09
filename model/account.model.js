const mongoose = require('mongoose');
const crypto = require("crypto");

const accountSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    email: String,
    password: String,
    token: {
        type: String,
        default: () => crypto.randomBytes(32).toString("hex")
    },
    role_id: String,
    avatar: String,
    status: {
        type: String,
        default: 'active'
    },
    createdBy: {
        account_id: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    deletedBy: {
        account_id: String,
        deletedBy: {
            type: Date
        }
    },
    updatedBy: [
        {  
            account_id: String,
            updatedAt: Date
        }
    ],
    deleted: {
        type: Boolean,
        default: false
    }
});
const Account =  mongoose.model('Account', accountSchema, 'account');
module.exports = Account;