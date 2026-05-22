const Setting = require('../../model/setting-general.model');

const settingMiddleware = async (req, res, next) => {
    try {
        const setting = await Setting.findOne();
        res.locals.settingGeneral = setting;
        next();
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = settingMiddleware;