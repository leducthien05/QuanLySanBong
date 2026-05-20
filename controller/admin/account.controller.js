const Account = require("../../model/account.model");
const Role = require("../../model/role.model");

const systemConfig = require("../../config/system");
const paginationHelper = require("../../helper/pagination.helper");
const searchHelper = require("../../helper/search.helper");
const filterStatusHelper = require("../../helper/filterStatus.helper");

// [GET] /admin/accounts
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    };

    const filter = filterStatusHelper.filterStatus(req.query);
    if (req.query.status) {
        find.status = req.query.status;
    }

    const sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.createdAt = "desc";
    }

    const objectSearch = searchHelper.search(req.query);
    if (objectSearch.regex) {
        find.$or = [
            { fullName: objectSearch.regex },
            { email: objectSearch.regex }
        ];
    }

    const countAccount = await Account.countDocuments(find);
    const objectPagination = await paginationHelper.pagination(req.query, countAccount);
    const account = await Account.find(find)
        .sort(sort)
        .skip(objectPagination.skipRecord)
        .limit(objectPagination.limit);
    const role = await Role.find({
        deleted: false
    });
    const roleMap = {};
    role.forEach(item =>{
        roleMap[item.id] = item.name
    });
    account.forEach(item =>{
        item.roleName = roleMap[item.role_id];
    });
    res.render("admin/page/account/index", {
        titlePage: "Tài khoản",
        account: account,
        pagination: objectPagination,
        keyword: objectSearch.keyword,
        filterStatus: filter
    });
};

// [GET] /admin/accounts/create
module.exports.create = async (req, res) => {
    const roles = await Role.find({ deleted: false, status: "active" });
    res.render("admin/page/account/create", {
        titlePage: "Thêm mới tài khoản",
        roles: roles
    });
};

// [POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
    try {
        const data = {
            fullName: req.body.fullName,
            phone: req.body.phone,
            email: req.body.email,
            password: req.body.password,
            role_id: req.body.role_id,
            avatar: req.body.avatar,
            status: req.body.status,
        };
        const account = new Account(data);
        await account.save();
        res.redirect(`${systemConfig.systemConfig.prefixAdmin}/accounts`);
    } catch (error) {
        console.log(error);
        res.redirect(req.get("referer") || "/");
    }
};

// [PATCH] /admin/accounts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;
    try {
        switch (status) {
            case "active":
                await Account.updateOne({
                    _id: id,
                    deleted: false
                }, {
                    $set: {
                        status: "inactive"
                    }
                });
                res.json({
                    code: 200,
                    status: "inactive"
                });
                break;
            case "inactive":
                await Account.updateOne({
                    _id: id,
                    deleted: false
                }, {
                    $set: {
                        status: "active"
                    }
                });
                res.json({
                    code: 200,
                    status: "active"
                });
                break;
            default:
                break;
        }
    } catch (error) {
        res.json({
            code: 201
        });
    }
};

// [PATCH] /admin/accounts/change-multi-status
module.exports.changeMultiStatus = async (req, res) => {
    const ids = req.body.ids.split(", ");
    const status = req.body.status;

    try {
        switch (status) {
            case "active":
                await Account.updateMany({
                    _id: ids
                }, { status: "active" });
                req.flash("success", `Thay đổi trạng thái ${ids.length} tài khoản thành công!`);
                break;
            case "inactive":
                await Account.updateMany({
                    _id: ids
                }, { status: "inactive" });
                req.flash("success", `Thay đổi trạng thái ${ids.length} tài khoản thành công!`);
                break;
            case "delete-all":
                await Account.updateMany({
                    _id: ids
                }, { deleted: true });
                req.flash("success", `Xóa thành công ${ids.length} tài khoản!`);
                break;
            default:
                break;
        }
    } catch (error) {
        console.log(error);
    }

    res.redirect(req.get("referer") || "/");
};

// [DELETE] /admin/accounts/delete/:id
module.exports.deleteAccount = async (req, res) => {
    const id = req.params.id;
    await Account.updateOne({
        _id: id,
        deleted: false
    }, {
        $set: {
            deleted: true
        }
    });
    res.json({
        code: 200,
        id: id
    });
};

// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
    const account = await Account.findOne({
        _id: req.params.id,
        deleted: false
    });
    const roles = await Role.find({ deleted: false, status: "active" });
    res.render("admin/page/account/edit", {
        titlePage: "Chỉnh sửa tài khoản",
        account: account,
        roles: roles
    });
};

// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (!updateData.password) {
            delete updateData.password;
        }
        await Account.updateOne({
            _id: req.params.id,
            deleted: false
        }, updateData);

        res.redirect(`${systemConfig.systemConfig.prefixAdmin}/accounts`);
    } catch (error) {
        console.log(error);
        res.redirect(req.get("referer") || "/");
    }
};

// [GET] /admin/accounts/detail/:id
module.exports.detail = async (req, res) => {
    const account = await Account.findOne({
        _id: req.params.id,
        deleted: false
    });
    const role = await Role.findOne({ _id: account.role_id, deleted: false });
    res.render("admin/page/account/detail", {
        titlePage: account.fullName,
        account: account,
        roleName: role ? role.name : ""
    });
};
