

// [GET] /admin/fields
module.exports.index = async (req, res)=>{
    res.render("admin/page/field/index", {
        titlePage: "Sân"
    });
}
// [GET] /admin/fields/create
module.exports.create = async (req, res)=>{
    res.render("admin/page/field/create", {
        titlePage: "Thêm sân bóng mới"
    });
}