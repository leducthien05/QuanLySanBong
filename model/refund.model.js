const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    booking_id: String,
    amount: Number,
    priceRefund: Number,
    user_id: String,
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
    processingBy: String,
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