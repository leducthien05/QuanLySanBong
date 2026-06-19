const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    field_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Field"
    },
    booking_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    },
    rating: Number,
    comment: String,
    date: Date,
    deleted: {
        type: Boolean,
        default: false
    }
});
const Review = mongoose.model('Review', reviewSchema, 'review');
module.exports = Review;