const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    // Loại payment
    title: {
        type: String,
        required: true,
    },

    // ========== COMMON ==========
    description: {
        type: String
    },

    momoQr: {
        type: String
    },

    status: {
        type: String,
        default: "active"
    },
    accountName: {
        type: String
    },
    accountNumber: String,
    // ========== BANKING ==========
    bankingBankName: {
        type: String
    },
    bankingQr: String,
    // ========== ZALOPAY ==========
    zalopayQr: String,
    // ========== VNPAY ==========
    vnpayMerchantCode: {
        type: String
    },

    vnpayAccessKey: {
        type: String
    },

    vnpaySecretKey: {
        type: String
    }

}, {
    timestamps: true
});

const Payment =  mongoose.model('Payment', paymentSchema, 'payment');
module.exports = Payment;