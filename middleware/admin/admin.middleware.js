const Setting = require('../../model/setting-general.model');
const Notification = require("../../model/notification.model");

module.exports.settingMiddleware = async (req, res, next) => {
    try {
        const setting = await Setting.findOne();
        res.locals.settingGeneral = setting;
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).send("Internal Server Error");
    }
    next();
};

module.exports.notificationMiddleware = async (req, res, next) => {
    try {
        const notification = await Notification.find({
            deleted: false,
            side: "admin",
            type: {$in: ["booking", "refund"]},
        }).limit(6).sort({createdAt: -1 });
        res.locals.notification = notification;
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).send("Internal Server Error");
    }
    next();
};