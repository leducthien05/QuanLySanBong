const Field = require("../../model/field.model");
const User = require("../../model/user.model");
const Booking = require("../../model/booking.model");
const Review = require("../../model/review.model");

module.exports.index = async (req, res) => {
    try {
        // ======================
        // THỐNG KÊ
        // ======================
        const totalFields = await Field.countDocuments({
            deleted: false,
            status: "active"
        });

        const totalUsers = await User.countDocuments({
            deleted: false,
            status: "active"
        });

        const totalBookings = await Booking.countDocuments({
            status: "completed"
        });

        // ======================
        // SÂN NỔI BẬT
        // ======================
        const featuredFields = await Field.find({
            deleted: false,
            status: "active"
        })
            .sort({
                "rating.totalRating": -1,
                bookingCount: -1
            })
            .limit(6);
        featuredFields.forEach(item => {
            item.priceFormat = Number(item.price.price).toLocaleString("vi-VN");
        });
        // ======================
        // KHU VỰC
        // ======================
        const areas = await Field.aggregate([
            {
                $match: {
                    deleted: false,
                    status: "active"
                }
            },
            {
                $group: {
                    _id: "$address",
                    totalFields: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    totalFields: -1
                }
            }
        ]);
        // ======================
        // REVIEW
        // ======================
        const reviewRating = await Review.find({
            rating: 5,
        }).limit(3);
        const idUser = [
            ...new Set(
                reviewRating.map(item => item.user_id.toString())
            )
        ];
        const userReview = await User.find({
            _id: { $in: idUser },
            deleted: false
        }).select("userName");
        const userMapReview = {};
        userReview.forEach(item => {
            userMapReview[item.id] = item;
        });
        reviewRating.forEach(item => {
            item.user = userMapReview[item.user_id];
        });
        // ======================
        // RENDER
        // ======================
        res.render("client/page/home/index", {
            pageTitle: "Trang chủ",

            statistics: {
                totalFields,
                totalUsers,
                totalBookings
            },

            featuredFields,
            areas,
            reviewRating
        });

    } catch (error) {
        console.log(error);

        res.redirect("/");
    }
};