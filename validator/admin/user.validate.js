module.exports.create = (req, res, next) => {
    if (!req.body.userName) {
        req.flash("error", "Vui lòng nhập tên người dùng");
        res.redirect(req.get("referer") || "/");
        return;
    }

    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email");
        res.redirect(req.get("referer") || "/");
        return;
    }

    if (!req.params.id && !req.body.password) {
        req.flash("error", "Vui lòng nhập mật khẩu");
        res.redirect(req.get("referer") || "/");
        return;
    }

    next();
};
