const mongoose = require("mongoose");
const crypto = require("crypto");

const bookingSchema = new mongoose.Schema({
    field_id: String,
    user_id: String,
    pricing_id: String,
    date: Date,
    totalPrice: Number,
    node: String,
    price: Number,
    service_id: String,
    createdAt: Date, 
    updatedAt: Date,
    deleted: {
        type: Boolean,
        default: false
    }
});
const Booking = mongoose.model('Booking', bookingSchema, 'booking');
module.exports = Booking;