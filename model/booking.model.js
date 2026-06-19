const mongoose = require("mongoose");
const crypto = require("crypto");

const bookingSchema = new mongoose.Schema({
    field_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Field"
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    pricing: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Pricing"
            },
            time: String,
            type: {
                type: String
            },
            price: Number
        }
    ],
    date: Date,
    totalPrice: Number,
    node: String,
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
    service: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service"
            },
            name: String,
            price: Number
        }
    ],
    deleted: {
        type: Boolean,
        default: false
    },
    expiredAt: Date
}, {
    timestamps: true
});
// index để cron tìm nhanh
bookingSchema.index({
    status: 1,
    expiredAt: 1
});
const Booking = mongoose.model('Booking', bookingSchema, 'booking');
module.exports = Booking;