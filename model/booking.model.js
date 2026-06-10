const mongoose = require("mongoose");
const crypto = require("crypto");

const bookingSchema = new mongoose.Schema({
    field_id: String,
    user_id: String,
    pricing: Array,
    date: Date,
    totalPrice: Number,
    node: String,
    paymentMethod: String,
    status: {
        type: String,
        enum: [
            "pending",
            "processing",
            "completed",
            "canceled",
            "failed"
        ],
        default: "pending"
    },
    service: Array,
    createdAt: Date, 
    updatedAt: Date,
    deleted: {
        type: Boolean,
        default: false
    },
    expiredAt: Date
});
// index để cron tìm nhanh
bookingSchema.index({
    status: 1,
    expiredAt: 1
});
const Booking = mongoose.model('Booking', bookingSchema, 'booking');
module.exports = Booking;