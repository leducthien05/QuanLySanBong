const Notification = require("../../model/notification.model");

// [PATCH] /admin/notification/read-all
module.exports.readall = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                user_id: req.accountAdmin.id,
                read: false
            },
            {
                read: true
            }
        );

        res.json({
            code: 200,
            message: "Đã cập nhật"
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Lỗi server"
        });
    }
}