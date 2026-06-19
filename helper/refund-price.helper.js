module.exports.refundPrice = (totalPrice, bookingTime) => {
    const now = new Date();

    const diffHours = (bookingTime - now) / (1000 * 60 * 60);

    if (diffHours > 24) {
        return totalPrice;
    }

    if (diffHours > 12) {
        return totalPrice * 0.7;
    }

    if (diffHours > 6) {
        return totalPrice * 0.5;
    }

    if (diffHours > 1) {
        return totalPrice * 0.3;
    }

    return 0;
}