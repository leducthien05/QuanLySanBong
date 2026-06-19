const Booking = require("../../model/booking.model");
const User = require("../../model/user.model");
const Field = require("../../model/field.model");
const Payment = require("../../model/payment.model");
const Transaction = require("../../model/transaction.model");

module.exports.index = async (req, res) => {
    try {

        const now = new Date();

        // ==========================
        // MỐC THỜI GIAN
        // ==========================

        const firstDayCurrentMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const firstDayPrevMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
        );

        const lastDayPrevMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            0,
            23,
            59,
            59
        );

        // ==========================
        // BOOKING THÁNG NÀY
        // ==========================

        const currentBookings = await Booking.find({
            status: "completed",
            createdAt: {
                $gte: firstDayCurrentMonth
            }
        });

        // ==========================
        // BOOKING THÁNG TRƯỚC
        // ==========================

        const prevBookings = await Booking.find({
            status: "completed",
            createdAt: {
                $gte: firstDayPrevMonth,
                $lte: lastDayPrevMonth
            }
        });

        // ==========================
        // DOANH THU
        // ==========================

        const currentRevenue = currentBookings.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

        const prevRevenue = prevBookings.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

        const revenuePercent = prevRevenue > 0 ? (((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : 0;

        // ==========================
        // LƯỢT ĐẶT SÂN
        // ==========================

        const bookingCount = currentBookings.length;

        // ==========================
        // USER MỚI
        // ==========================

        const newUsers =
            await User.countDocuments({
                createdAt: {
                    $gte: firstDayCurrentMonth
                }
            });

        // ==========================
        // GIÁ TRỊ TRUNG BÌNH
        // ==========================

        const avgOrderValue =
            bookingCount > 0
                ? Math.round(
                    currentRevenue / bookingCount
                )
                : 0;

        // ==========================
        // TỶ LỆ HỦY
        // ==========================

        const totalBookingsMonth =
            await Booking.countDocuments({
                createdAt: {
                    $gte: firstDayCurrentMonth
                }
            });

        const cancelledBookings =
            await Booking.countDocuments({
                status: "canceled",
                createdAt: {
                    $gte: firstDayCurrentMonth
                }
            });

        const cancelRate =
            totalBookingsMonth > 0
                ? (
                    (cancelledBookings /
                        totalBookingsMonth) *
                    100
                ).toFixed(1)
                : 0;

        // ==========================
        // BIỂU ĐỒ 30 NGÀY GẦN NHẤT
        // ==========================

        const revenueChart = [];

        for (let i = 29; i >= 0; i--) {

            const start = new Date();

            start.setDate(
                start.getDate() - i
            );

            start.setHours(
                0,
                0,
                0,
                0
            );

            const end = new Date(start);

            end.setHours(
                23,
                59,
                59,
                999
            );

            const bookings =
                await Booking.find({
                    status: "completed",
                    createdAt: {
                        $gte: start,
                        $lte: end
                    }
                });

            const revenue =
                bookings.reduce(
                    (sum, item) =>
                        sum +
                        (item.totalPrice || 0),
                    0
                );

            revenueChart.push({
                label: `${start.getDate()}/${start.getMonth() + 1}`,
                revenue: revenue
            });
        }

        // ==========================
        // TOP 5 SÂN DOANH THU
        // ==========================

        const topFields = await Booking.aggregate([
            {
                $match: {
                    status: "completed"
                }
            },
            {
                $group: {
                    _id: "$field_id",
                    revenue: {
                        $sum: "$totalPrice"
                    }
                }
            },
            {
                $sort: {
                    revenue: -1
                }
            },
            {
                $limit: 5
            }
        ]);
        for (const item of topFields) {
            item.field = await Field.findById(
                item._id
            );
        }
        // ==========================
        // CHI TIẾT GIAO DỊCH
        // ==========================

        const transactions = await Transaction.find({
            deleted: false
        })
            .populate({
                path: "user_id",
                select: "userName email"
            })
            .populate({
                path: "booking_id",
                select: "field_id date totalPrice status",
                populate: {
                    path: "field_id",
                    select: "name"
                }
            })
            .sort({ createdAt: -1 })
            .lean();

        // ==========================
        // RENDER
        // ==========================
        res.render("admin/page/revenue/index", {
            titlePage: "Báo cáo doanh thu",

            statistic: {
                currentRevenue: currentRevenue,
                prevRevenue: prevRevenue,
                revenuePercent: revenuePercent,
                bookingCount: bookingCount,
                newUsers: newUsers,
                avgOrderValue: avgOrderValue,
                cancelRate: cancelRate
            },

            revenueChart: revenueChart,

            topFields: topFields,

            transactions: transactions
        }
        );

    } catch (error) {
        console.log(error);

        res.redirect("/admin/dashboard");
    }
};