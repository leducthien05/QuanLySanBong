const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    content: String,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: String,
    side: String,
    type: String,
    read: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
const Notification = mongoose.model('Notification', notificationSchema, 'notification');
module.exports = Notification;