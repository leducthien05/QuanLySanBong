const dashboardRouter = require("./dashboard.router");
const fieldRouter = require("./field.router");
const serviceRouter = require("./service.router");
const accountRouter = require("./account.router");
const roleRoute = require("./role.router");
const bookingRouter = require("./booking.router");
const userRouter = require("./user.router");
const authRouter = require("./auth.router");
const myaccountRouter = require("./myaccount.router");

const authMiddleware = require("../../middleware/admin/auth.middleware");

const systemConfig = require("../../config/system");

module.exports = (app) =>{
    const prefixAdmin = systemConfig.systemConfig.prefixAdmin;
    app.use(prefixAdmin + "/dashboard", authMiddleware.requireAuth, dashboardRouter);
    app.use(prefixAdmin + "/fields", authMiddleware.requireAuth, fieldRouter);
    app.use(prefixAdmin + "/services", authMiddleware.requireAuth, serviceRouter);
    app.use(prefixAdmin + "/accounts", authMiddleware.requireAuth, accountRouter);
    app.use(prefixAdmin + "/roles", authMiddleware.requireAuth, roleRoute);
    app.use(prefixAdmin + "/bookings", authMiddleware.requireAuth, bookingRouter);
    app.use(prefixAdmin + "/users", authMiddleware.requireAuth, userRouter);
    app.use(prefixAdmin + "/myaccount", authMiddleware.requireAuth, myaccountRouter);
    app.use(prefixAdmin + "/auth", authRouter);

}
