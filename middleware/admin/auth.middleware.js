const prefixAdmin = require("../../config/system");
const Account = require("../../model/account.model");
const Role = require("../../model/role.model");

module.exports.requireAuth = async (req, res, next)=>{
    if(!req.cookies.token){
        res.redirect(`${prefixAdmin.systemConfig.prefixAdmin}/auth/login`);
        return;
    }else{
        const record = await Account.findOne({
            token: req.cookies.token
        }).select("-password");
        if(record){
            const role = await Role.findOne({
                _id: record.role_id
            }).select("name permission");
            res.locals.accountRole = role;
            res.locals.accountAdmin = record;
            next();
        }else{
            res.redirect(`${prefixAdmin.systemConfig.prefixAdmin}/auth/login`);
            return;
        }
    }
}