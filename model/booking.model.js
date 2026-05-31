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
        default: "active"
    },
    service: Array,
    createdAt: Date, 
    updatedAt: Date,
    deleted: {
        type: Boolean,
        default: false
    }
});

const Booking = mongoose.model('Booking', bookingSchema, 'booking');
module.exports = Booking;