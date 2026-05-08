const dashboardRouter = require("./dashboard.router");

const systemConfig = require("../../config/system");

module.exports = (app) =>{
    const prefixAdmin = systemConfig.systemConfig.prefixAdmin;
    app.use(prefixAdmin + "/dashboard", dashboardRouter);
}
