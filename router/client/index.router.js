const homeRouter = require("./home.router");
const bookingRouter = require("./booking.router");
const fieldRouter = require("./field.router");
const authRouter = require("./auth.router");
const userRouter = require("./user.router");
const reviewRouter = require("./review.router");
const chatbotRouter = require("./chatbotAi.router");

const settingMiddleware = require("../../middleware/client/client.middleware");
const authMiddleware = require("../../middleware/client/auth.middleware");

module.exports = (app) => {
    app.use(settingMiddleware.settingMiddleware);
    app.use("/", homeRouter);
    app.use("/field", fieldRouter);
    app.use("/booking", bookingRouter);
    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/chatbot", chatbotRouter);
    app.use("/review", authMiddleware.auth, reviewRouter);
};