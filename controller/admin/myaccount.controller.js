const Account = require("../../model/account.model");
const Role = require("../../model/role.model");

const passwordHelper = require("../../helper/password.helper");

// [GET] /admin/myaccount/
module.exports.detail = async (req, res) => {
    const account = res.locals.accountAdmin;
    res.render("admin/page/myaccount/detail", {
        titlePage: account.fullName
    });
};
// [PATCH] /admin/myaccount/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const existEmail = await Account.findOne({
            email: req.body.password,
            _id: {$ne: req.params.id},
            deleted: false
        });
        if(existEmail){
            req.flash("error", "Email đã tồn tại!");
            return res.redirect(req.get("referer") || "/");
        }
        if (!req.body.password) {
            delete req.body.password;
        }else{
            req.body.password = await hashPassword(req.body.password);
        }
        await Account.updateOne({
            _id: req.params.id,
            deleted: false
        }, req.body);

        res.redirect(`${systemConfig.systemConfig.prefixAdmin}/accounts`);
    } catch (error) {
        console.log(error);
        res.redirect(req.get("referer") || "/");
    }
};