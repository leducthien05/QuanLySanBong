const dashboardRouter = require("./dashboard.router");
const fieldRouter = require("./field.router");
const serviceRouter = require("./service.router");

const systemConfig = require("../../config/system");

module.exports = (app) =>{
    const prefixAdmin = systemConfig.systemConfig.prefixAdmin;
    app.use(prefixAdmin + "/dashboard", dashboardRouter);
    app.use(prefixAdmin + "/fields", fieldRouter);
    app.use(prefixAdmin + "/services", serviceRouter);
}
