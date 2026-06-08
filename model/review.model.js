const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user_id: String,
    field_id: String,
    fieldName: String,
    address: String,
    booking_id: String,
    rating: Number,
    comment: String,
    date: Date,
    deleted: {
        type: Boolean,
        default: false
    }
});
const Review =  mongoose.model('Review', reviewSchema, 'review');
module.exports = Review;