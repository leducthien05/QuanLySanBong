module.exports.create = (req, res, next)=>{
    if (!req.body.name) {
        req.flash("error", "Vui lòng nhập tên");
        res.redirect(req.get("referer") || "/");
        return;
    }
     if (!req.body.price) {
        req.flash("error", "Vui lòng chọn loại sân");
        res.redirect(req.get("referer") || "/");
        return;
    }
    next();
}