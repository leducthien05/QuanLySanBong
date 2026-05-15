module.exports.create = (req, res, next)=>{
    if (!req.body.name) {
        req.flash("error", "Vui lòng nhập tên");
        res.redirect(req.get("referer") || "/");
        return;
    }
    if (!req.body.type) {
        req.flash("error", "Vui lòng chọn loại sân");
        res.redirect(req.get("referer") || "/");
        return;
    }
     if (!req.body.priceVip) {
        req.flash("error", "Vui lòng chọn loại sân");
        res.redirect(req.get("referer") || "/");
        return;
    }
     if (!req.body.price) {
        req.flash("error", "Vui lòng chọn loại sân");
        res.redirect(req.get("referer") || "/");
        return;
    }
    if (!req.body.timeactive) {
        req.flash("error", "Vui lòng nhập thời gian hoạt động");
        res.redirect(req.get("referer") || "/");
        return;
    }
    if (!req.body.titleAddress) {
        req.flash("error", "Vui lòng nhập địa chỉ");
        res.redirect(req.get("referer") || "/");
        return;
    }
    if (!req.body.googleMapUrl) {
        req.flash("error", "Vui lòng nhập địa chỉ google map");
        res.redirect(req.get("referer") || "/");
        return;
    }
    if (!req.body.googleMapUrl) {
        req.flash("error", "Vui lòng nhập địa chỉ google map");
        res.redirect(req.get("referer") || "/");
        return;
    }
    next();
}