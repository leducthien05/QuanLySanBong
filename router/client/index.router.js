const homeRouter = require("./home.router");
const bookingRouter = require("./booking.router");
const fieldRouter = require("./field.router");
const authRouter = require("./auth.router");

const settingMiddleware = require("../../middleware/client/client.middleware");

module.exports = (app) => {
    app.use(settingMiddleware.settingMiddleware);
    app.use("/", homeRouter);
    app.use("/field", fieldRouter);
    app.use("/booking", bookingRouter);
    app.use("/auth", authRouter);
};