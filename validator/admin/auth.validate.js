module.exports.login = (req, res, next) => {
    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email");
        res.redirect(req.get("referer") || "/");
        return;
    }

    if (!req.body.password) {
        req.flash("error", "Vui lòng nhập mật khẩu");
        res.redirect(req.get("referer") || "/");
        return;
    }

    next();
};
