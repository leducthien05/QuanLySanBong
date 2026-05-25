const Booking = require("../../model/booking.model");
const Field = require("../../model/field.model");
const Service = require("../../model/service.model");

module.exports.index = async (req, res) =>{
    res.render("client/page/booking/index", {
        pageTitle: "Đặt Sân Bóng - Quản Lý Sân Bóng"
    });
}