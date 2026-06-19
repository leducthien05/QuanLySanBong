const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    booking_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    payment_method: {
        type: String, 
        enum: ["cash", "momo", "vnpay", "banking"], 
        ref: "user", 
        required: true
    },

    transaction_code: {
        type: String,
        unique: true
    },

    status: {
        type: String,
        enum: ["pending", "success", "failed", "refunded"],
        default: "pending"
    },

    payment_time: Date,

    note: String,

    deleted: {
        type: Boolean,
        default: false
    },

    deletedAt: Date
}, {
    timestamps: true
});

const Transaction = mongoose.model("Transaction", transactionSchema, "transaction");

module.exports = Transaction;