const Account = require("../../model/account.model");
const Role = require("../../model/role.model");

const passwordHelper = require("../../helper/password.helper");
const systemConfig = require("../../config/system");

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
        if (!req.body.password) {
            delete req.body.password;
        }else{
            req.body.password = await passwordHelper.hashPassword(req.body.password);
        }
        await Account.updateOne({
            _id: req.params.id,
            deleted: false
        }, req.body);

        res.redirect(req.get("referer") || "/");
    } catch (error) {
        console.log(error);
        res.redirect(req.get("referer") || "/");
    }
};