
module.exports.dashboard = async (req, res)=>{
    res.render("admin/page/dashboard/index", {
        titlePage: "Dashboard"
    });
}