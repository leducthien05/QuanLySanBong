const Setting = require('../../model/setting-general.model');
const Notification = require("../../model/notification.model");
const User = require("../../model/user.model");
const jwt = require("jsonwebtoken");

module.exports.settingMiddleware = async (req, res, next) => {
    try {
        const setting = await Setting.findOne();
        res.locals.settingGeneral = setting;

        const tokenUser = req.cookies.tokenUser;

        if (!tokenUser) {
            return next();
        }

        const decoded = jwt.verify(
            tokenUser,
            process.env.JWT_ACCESS_SECRET
        );
        const user = await User.findOne({
            deleted: false,
            status: "active",
            _id: decoded.id
        }).select("-password");
        req.user = decoded;
        res.locals.user = user;

    } catch (error) {
        console.error(error);
    }

    next();
};