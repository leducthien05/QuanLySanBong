const Booking = require("../../model/booking.model");
const User = require("../../model/user.model");
const Field = require("../../model/field.model");
const Payment = require("../../model/payment.model");

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

        const transactions = await Booking.find({
            status: {
                $in: ["completed", "canceled"]
            }
        }).sort({ createdAt: -1 }).limit(20);


        // ID 
        const paymentIds = transactions.map(item => item.paymentMethod);
        const userIds = transactions.map(item => item.user_id);
        const fieldIds = transactions.map(item => item.field_id);

        // Dữ liệu trong DB
        const payments = await Payment.find({
            _id: { $in: paymentIds }
        }).select("title");
        const fields = await Field.find({
            _id: { $in: fieldIds }
        }).select("name");

        const users = await User.find({
            _id: { $in: userIds }
        }).select("userName");

        // Map dữ liệu
        const userMap = {};
        const fieldMap = {};
        const paymentMap = {};

        users.forEach(user => {
            userMap[user._id.toString()] = user;
        });

        fields.forEach(field => {
            fieldMap[field._id.toString()] = field;
        });

        payments.forEach(payment => {
            paymentMap[payment._id.toString()] = payment;
        });

        // Gán dữ liệu
        transactions.forEach(item => {
            item.userInfo = userMap[item.user_id] || null;
            item.fieldInfo = fieldMap[item.field_id] || null;
            item.paymentInfo = paymentMap[item.paymentMethod] || null;
        });

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