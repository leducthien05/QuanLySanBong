module.exports.register = (req, res, next) => {
    if (!req.body.surname || !req.body.name) {
        req.flash("error", "Vui lòng nhập họ tên");
        res.redirect(req.get("referer") || "/");
        return;
    }

    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email");
        res.redirect(req.get("referer") || "/");
        return;
    }

    if (!req.body.phone) {
        req.flash("error", "Vui lòng nhập số điện thoại");
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

module.exports.login = (req, res, next) => {
    if (!req.body.email) {
        req.flash("error", "Vui lòng nhập email");
        res.redirect(req.get("referer") || "/");
        return;
    }

    if (!req.body.password) {
        req.flash("error", "Vui lòng nhập password");
        res.redirect(req.get("referer") || "/");
        return;
    }

    next();
};

module.exports.resetPassword = (req, res, next) => {
    if (!req.body.email) {
        req.flash("error", "Vui lòng không xóa email");
        res.redirect(req.get("referer") || "/");
        return;
    }

    if (!req.body.password) {
        req.flash("error", "Vui lòng nhập password");
        res.redirect(req.get("referer") || "/");
        return;
    }

    if (!req.body.confirmPassword) {
        req.flash("error", "Vui lòng xác nhận lại password");
        res.redirect(req.get("referer") || "/");
        return;
    }

    if (req.body.confirmPassword != req.body.password) {
        req.flash("error", "Mật khẩu không khớp");
        res.redirect(req.get("referer") || "/");
        return;
    }
    next();
};