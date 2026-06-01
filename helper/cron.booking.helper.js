const cron = require("node-cron");

const Booking = require("../model/booking.model");

// chạy mỗi phút
cron.schedule("0 * * * *", async () => {
    try {
        const now = new Date();

        const result = await Booking.updateMany(
            {
                status: "pending",
                expiredAt: { $lte: now }
            },
            {
                $set: { status: "failed" }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`Đã cập nhật ${result.modifiedCount} booking`);
        }

    } catch (err) {
        console.error("Cron lỗi:", err);
    }
}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
});