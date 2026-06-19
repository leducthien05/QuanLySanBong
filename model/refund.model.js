const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    booking_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    },
    amount: Number,
    priceRefund: Number,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    bankName: String,

    accountNumber: String,

    accountName: String,

    status: {
        type: String,
        enum: [
            "pending",
            "completed"
        ],
        default: "pending"
    },

    createdAt: Date,
    processingBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account" 
    },
    processingAt: Date,
    completedBy: String,
    completedAt: Date,
    deleted: {
        type: Boolean,
        default: false
    }
});
const Refund = mongoose.model('Refund', refundSchema, 'refund');
module.exports = Refund;