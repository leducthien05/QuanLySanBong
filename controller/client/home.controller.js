const Booking = require("../../model/booking.model");
const Field = require("../../model/field.model");

module.exports.index = async (req, res) => {
    try {
        const fields = await Field.find();
        const bookings = await Booking.find().populate("field").populate("account");
        res.render("client/page/home/index", {
            title: "Trang chủ",
            fields,
            bookings,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }   
};