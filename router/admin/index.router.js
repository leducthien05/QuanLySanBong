const dashboardRouter = require("./dashboard.router");
const fieldRouter = require("./field.router");
const serviceRouter = require("./service.router");
const accountRouter = require("./account.router");
const roleRoute = require("./role.router");
const bookingRouter = require("./booking.router");
const userRouter = require("./user.router");

const systemConfig = require("../../config/system");

module.exports = (app) =>{
    const prefixAdmin = systemConfig.systemConfig.prefixAdmin;
    app.use(prefixAdmin + "/dashboard", dashboardRouter);
    app.use(prefixAdmin + "/fields", fieldRouter);
    app.use(prefixAdmin + "/services", serviceRouter);
    app.use(prefixAdmin + "/accounts", accountRouter);
    app.use(prefixAdmin + "/roles", roleRoute);
    app.use(prefixAdmin + "/bookings", bookingRouter);
    app.use(prefixAdmin + "/users", userRouter);
}
