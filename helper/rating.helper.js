module.exports.rating = (review) => {
    // Đánh giá số sao
    const stats = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    };

    review.forEach(item => {
        stats[item.rating]++;
    });

    const totalReview = review.length;

    const percent = {
        1: totalReview ? (stats[1] / totalReview) * 100 : 0,
        2: totalReview ? (stats[2] / totalReview) * 100 : 0,
        3: totalReview ? (stats[3] / totalReview) * 100 : 0,
        4: totalReview ? (stats[4] / totalReview) * 100 : 0,
        5: totalReview ? (stats[5] / totalReview) * 100 : 0,
    };
    const avgRating = totalReview ? (review.reduce((sum, item) => sum + item.rating, 0) / totalReview).toFixed(1) : "0.0";

    return {
        stats: stats,
        totalReview: totalReview,
        avgRating: avgRating,
        percent: percent
    }
}