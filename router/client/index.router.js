const homeRouter = require("./home.router");

module.exports = (app) => {
    app.use("/", homeRouter);
};