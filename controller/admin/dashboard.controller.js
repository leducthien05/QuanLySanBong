const User = require("../../model/user.model");
const Field = require("../../model/field.model");
const Booking = require("../../model/booking.model");
const Refund = require("../../model/refund.model");
const Service = require("../../model/service.model");
const Review = require("../../model/review.model");

module.exports.index = async (req, res) => {
    try {

        // Tổng sân
        const totalFields = await Field.countDocuments({
            deleted: false
        });

        // Sân hoạt động
        const activeFields = await Field.countDocuments({
            deleted: false,
            status: "active"
        });

        // Sân bảo trì
        const maintenanceFields = await Field.countDocuments({
            deleted: false,
            status: "inactive"
        });

        // Người dùng
        const totalUsers = await User.countDocuments({
            deleted: false
        });

        // Đặt sân
        const totalBookings = await Booking.countDocuments({
            deleted: false,
            status: "completed" || "canceled" || "paid"
        });

        // Hoàn tiền
        const totalRefund = await Refund.countDocuments({
            deleted: false
        });

        // Dịch vụ
        const totalServices = await Service.countDocuments({
            deleted: false
        });

        // Đánh giá
        const totalReviews = await Review.countDocuments({
            deleted: false
        });


        // Hôm nay
        const today = new Date();

        const startDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

        const endDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1
        );

        const todayBookings = await Booking.countDocuments({
            bookingDate: {
                $gte: startDay,
                $lt: endDay
            }
        });

        // Doanh thu
        const revenueResult = await Booking.aggregate([
            {
                $match: {
                    paymentStatus: "complete"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$totalPrice"
                    }
                }
            }
        ]);

        const totalRevenue =
            revenueResult.length > 0
                ? revenueResult[0].totalRevenue
                : 0;

        // 5 đơn gần nhất
        const latestBookings = await Booking.find({
            deleted: false,
            status: "paid" || "completed"
        })
        .sort({
            createdAt: -1
        })
        .limit(5)
        .populate("user_id")
        .populate("field_id");

        // Top sân được đặt nhiều nhất
        const topFields = await Booking.aggregate([
            {
                $group: {
                    _id: "$fieldId",
                    bookingCount: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    bookingCount: -1
                }
            },
            {
                $limit: 5
            }
        ]);

        for (const item of topFields) {
            const field = await Field.findById(item._id);

            item.name = field ? field.name : "Đã xóa";
        }

        const statistic = {
            totalFields,
            activeFields,
            maintenanceFields,

            totalUsers,

            totalBookings,
            todayBookings,

            totalRevenue,

            totalRefund,

            totalServices,
            totalReviews
        };

        res.render("admin/page/dashboard/index", {
            titlePage: "Dashboard",
            statistic: statistic,
            latestBookings: latestBookings,
            topFields: topFields
        });

    } catch (error) {
        console.log(error);

        res.redirect("/admin");
    }
};