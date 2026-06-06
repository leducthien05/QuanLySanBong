const Pricing = require("../model/pricing.model");
const Booking = require("../model/booking.model");

module.exports.getPricing = async (date, field_id) => {
    // date dạng YYYY-MM-DD
    const now = new Date();
    const today =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0");

    const nowMin =
        now.getHours() * 60 +
        now.getMinutes();

    let [year, month, day] = date.split("-").map(Number);
    if(day < now.getDate().toString()){
        day = now.getDate().toString();
    }

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

    // Lấy bảng giá theo thứ
    const pricing = await Pricing.find({
        deleted: false,
        field_id,
        day_of_week: days[dayOfWeek]
    }).lean();

    // Lấy các booking đã thanh toán
    const bookings = await Booking.find({
        deleted: false,
        field_id,
        status: "paid",
        date
    }).lean();

    // Map các slot đã được đặt
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

    // Ngày hiện tại theo local timezone

    pricing.forEach(item => {
        // Đã có người đặt
        if (bookingMap[item._id.toString()]) {
            item.booked = "1";
        }

        // Chỉ disable khi đang xem lịch hôm nay
        if (date === today) {
            const startMin = toMinute(item.start_time);

            // Qua giờ hoặc còn dưới 30 phút
            if (startMin - nowMin < 30) {
                item.disable = "1";
            }
        }
    });
    const dataQueryPricing = {
        pricing: pricing,
        date: today
    }

    return dataQueryPricing;
};