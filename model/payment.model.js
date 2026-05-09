const mongoose = require("mongoose");
const crypto = require("crypto");

const paymentSchema = new mongoose.Schema({
    booking_id: String,
    method: String,
    amount: String,
    status: {
        type: String,
        default: "active"
    },
});
const Payment = mongoose.model('Payment', paymentSchema, 'payment');
module.exports = Payment;