module.exports.create = (req, res, next)=>{
    if (!req.body.name) {
        req.flash("error", "Vui lòng nhập tên");
        res.redirect("back");
        return;
    }
    if (!req.body.type) {
        req.flash("error", "Vui lòng chọn loại sân");
        res.redirect("back");
        return;
    }
    if (!req.body.titleAddress) {
        req.flash("error", "Vui lòng nhập địa chỉ");
        res.redirect("back");
        return;
    }
    if (!req.body.googleMapUrl) {
        req.flash("error", "Vui lòng nhập địa chỉ google map");
        res.redirect("back");
        return;
    }
    if (!req.body.googleMapUrl) {
        req.flash("error", "Vui lòng nhập địa chỉ google map");
        res.redirect("back");
        return;
    }
    next();
}