const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema({
    field_id: String,
    day_of_week: String,
    date: Date,
    start_time: String,
    feature: String,
    price: Number,
    createdAt: Date,
    updatedAt: Date,
    deleted: {
        type: Boolean,
        default: false
    }
});
const Pricing = mongoose.model('Pricing', pricingSchema, 'pricing');
module.exports = Pricing;