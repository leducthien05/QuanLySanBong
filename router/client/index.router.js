const homeRouter = require("./home.router");
const bookingRouter = require("./booking.router");

const settingMiddleware = require("../../middleware/client/client.middleware")

module.exports = (app) => {
    app.use(settingMiddleware.settingMiddleware);
    app.use("/", homeRouter);
    app.use("/booking", bookingRouter);
};