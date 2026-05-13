const mongoose = require("mongoose");
const crypto = require("crypto");

const slotSchema = new mongoose.Schema({
    field_id: String,
    slot_date: Date,
    start_time: Date,
    end_time: Date,
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
const Slot = mongoose.model('Slot', slotSchema, 'slot');
module.exports = Slot;