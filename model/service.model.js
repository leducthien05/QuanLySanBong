const mongoose = require("mongoose");
const crypto = require("crypto");

const serviceSchema = new mongoose.Schema({
    name: String,
    stock: Number,
    type: String,
    status: {
        type: String,
        default: "active"
    },
    price: Number,
    createdAt: Date, 
    updatedAt: Date,
    deleted: {
        type: Boolean,
        default: false
    }
});
const Service = mongoose.model('Service', serviceSchema, 'service');
module.exports = Service;