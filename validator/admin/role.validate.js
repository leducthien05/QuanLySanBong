module.exports.create = (req, res, next) => {
    if (!req.body.name) {
        req.flash("error", "Vui lòng nhập tên vai trò");
        res.redirect(req.get("referer") || "/");
        return;
    }

    next();
};
