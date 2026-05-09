const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user_id: String,
    feild_id: String,
    booking_id: String,
    rating: Number,
    comment: String,
    expireAt: {
        type: Date,
        expires: 180
    }
});
const Review =  mongoose.model('Review', reviewSchema, 'review');
module.exports = Review;