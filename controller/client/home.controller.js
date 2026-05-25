const Booking = require("../../model/booking.model");
const Field = require("../../model/field.model");
const Service = require("../../model/service.model");

module.exports.index = async (req, res) => {
    try {
        const find = {
            deleted: false,
            status: "active",
            feature: "1"
        }
        const fields = await Field.find(find).sort({ "rating.totalRating": -1 }).limit(6);
        const service = await Service.find({
            deleted: false,
            status: "active",
        });
        res.render("client/page/home/index", {
            title: "Trang chủ",
            fields: fields,
            services: service
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }   
};