const mongoose = require("mongoose");
const crypto = require("crypto");

const bookingSchema = new mongoose.Schema({
    field_id: String,
    user_id: String,
    pricing_id: String,
    date: Date,
    totalPrice: Number,
    node: String,
    paymentMethod: String,
    price: Number,
    service: Array,
    createdAt: Date, 
    updatedAt: Date,
    deleted: {
        type: Boolean,
        default: false
    }
});

bookingSchema.index(
    {
        field_id: 1,
        date: 1,
        pricing_id: 1
    },
    {
        unique: true
    }
);
const Booking = mongoose.model('Booking', bookingSchema, 'booking');
module.exports = Booking;