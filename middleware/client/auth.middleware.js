const User = require("../../model/user.model");
const jwt = require("jsonwebtoken");
module.exports.auth = async (req, res, next) => {
    const tokenUser = req.cookies.tokenUser;
    if (!tokenUser) {
        req.flash("error", "Vui lòng đăng nhập để tiếp tục!");
        return res.redirect("/auth");
    }
    try {
        const decoded = jwt.verify(
            tokenUser,
            process.env.JWT_ACCESS_SECRET
        );
        return next();
    } catch (error) {
        return res.sendStatus(403);
    }
}