const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    content: String,
    time: Number,
    deleted: {
        type: Boolean,
        default: false
    }   
}, {
    timestamps: true
});
const Notification = mongoose.model('Notification', notificationSchema, 'notification');
module.exports = Notification;