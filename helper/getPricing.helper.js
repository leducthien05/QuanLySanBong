const Pricing = require("../model/pricing.model");
const Booking = require("../model/booking.model");

module.exports.getPricing = async (date, field_id) => {
    const now = new Date();
    const today =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0");

    const nowMin = now.getHours() * 60 + now.getMinutes();

    const [year, month, day] = date.split("-").map(Number);

    const dayOfWeek = new Date(year, month - 1, day).getDay();
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const pricing = await Pricing.find({
        deleted: false,
        field_id,
        day_of_week: days[dayOfWeek]
    }).lean();

    const bookings = await Booking.find({
        deleted: false,
        field_id,
        status: "paid",
        date: date
    }).lean();

    const bookingMap = {};
    bookings.forEach(booking => {
        booking.pricing.forEach(slot => {
            bookingMap[slot.id.toString()] = true;
        });
    });

    const toMinute = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    pricing.forEach(item => {
        if (bookingMap[item._id.toString()]) {
            item.booked = "1";
        }

        if (date === today) {
            const startMin = toMinute(item.start_time);
            if (startMin - nowMin < 30) {
                item.disable = "1";
            }
        }
    });

    return {
        pricing: pricing,
        date: date
    };
};