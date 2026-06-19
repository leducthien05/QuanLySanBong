const User = require("../../model/user.model");
const Field = require("../../model/field.model");
const Review = require("../../model/review.model");

module.exports.create = async (req, res) => {
    try {
        // Thông tin sân
        const field = await Field.findOne({
            _id: req.params.id,
            deleted: false,
            status: "active"
        });

        // Số sao đánh giá
        let rating = 0;
        if (req.body.rating) {
            rating = parseInt(req.body.rating);
        } else {
            rating = "";
        }

        // Ngày đánh giá
        const now = new Date();
        const today =
            now.getFullYear() +
            "-" +
            String(now.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(now.getDate()).padStart(2, "0");
        const dateVN = new Date(today);

        // Dữ liệu đánh giá
        const data = {
            user_id: req.user.id,
            field_id: req.params.id,
            fieldName: field.name,
            address: field.address.titleAddress,
            rating: rating,
            comment: req.body.comment,
            date: dateVN,
        }

        await Review.create(data);

        // Người đánh giá
        const user = await User.findOne({
            _id: req.user.id,
            deleted: false,
            status: "active"
        }).select("-password");

        res.json({
            code: 200,
            data: data,
            user: user
        });
    } catch (error) {
        res.status(400).json({
            message: "Lỗi dữ liệu tải lên",
            error: error
        })
    }
}