const Setting = require('../../model/setting-general.model');
const Notification = require("../../model/notification.model");
const User = require("../../model/user.model");
const jwt = require("jsonwebtoken");

module.exports.settingMiddleware = async (req, res, next) => {
    try {
        const setting = await Setting.findOne();
        res.locals.settingGeneral = setting;

        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return next();
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_ACCESS_SECRET
        );

        req.user = decoded;
        res.locals.user = decoded;

    } catch (error) {
        console.error(error);
    }

    next();
};