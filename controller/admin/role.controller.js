const Role = require("../../model/role.model");
const Account = require("../../model/account.model");

const systemConfig = require("../../config/system");
const paginationHelper = require("../../helper/pagination.helper");
const searchHelper = require("../../helper/search.helper");
const filterStatusHelper = require("../../helper/filterStatus.helper");

// [GET] /admin/roles
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    };
    // Lọc theo trạng thái
    const filter = filterStatusHelper.filterStatus(req.query);
    if (req.query.status) {
        find.status = req.query.status;
    }
    // Sắp xếp vai trò theo tiêu chí
    const sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.createdAt = "desc";
    }
    // Tìm kiếm
    const objectSearch = searchHelper.search(req.query);
    if (objectSearch.regex) {
        find.$or = [
            { name: objectSearch.regex },
            { description: objectSearch.regex }
        ];
    }
    // Phân trang
    const countRole = await Role.countDocuments(find);
    const objectPagination = await paginationHelper.pagination(req.query, countRole);
    const role = await Role.find(find)
        .sort(sort)
        .skip(objectPagination.skipRecord)
        .limit(objectPagination.limit);
    res.render("admin/page/role/index", {
        titlePage: "Vai trò",
        role: role,
        pagination: objectPagination,
        keyword: objectSearch.keyword,
        filterStatus: filter
    });
};

// [GET] /admin/roles/create
module.exports.create = async (req, res) => {
    res.render("admin/page/role/create", {
        titlePage: "Thêm mới vai trò",
    });
};

// [POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            description: req.body.description,
            status: req.body.status,
        };
        const role = new Role(data);
        await role.save();
        res.redirect(`${systemConfig.systemConfig.prefixAdmin}/roles`);
    } catch (error) {
        console.log(error);
        res.redirect(req.get("referer") || "/");
    }
};

// [PATCH] /admin/roles/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;
    try {
        switch (status) {
            case "active":
                await Role.updateOne({
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
                await Role.updateOne({
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

// [PATCH] /admin/roles/change-multi-status
module.exports.changeMultiStatus = async (req, res) => {
    const ids = req.body.ids.split(", ");
    const status = req.body.status;

    try {
        switch (status) {
            case "active":
                await Role.updateMany({
                    _id: ids
                }, { status: "active" });
                req.flash("success", `Thay đổi trạng thái ${ids.length} vai trò thành công!`);
                break;
            case "inactive":
                await Role.updateMany({
                    _id: ids
                }, { status: "inactive" });
                req.flash("success", `Thay đổi trạng thái ${ids.length} vai trò thành công!`);
                break;
            case "delete-all":
                await Role.updateMany({
                    _id: ids
                }, { deleted: true });
                req.flash("success", `Xóa thành công ${ids.length} vai trò!`);
                break;
            default:
                break;
        }
    } catch (error) {
        console.log(error);
    }

    res.redirect(req.get("referer") || "/");
};

// [DELETE] /admin/roles/delete/:id
module.exports.deleteRole = async (req, res) => {
    const id = req.params.id;
    await Role.updateOne({
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

// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
    const role = await Role.findOne({
        _id: req.params.id,
        deleted: false
    });
    res.render("admin/page/role/edit", {
        titlePage: "Chỉnh sửa vai trò",
        role: role
    });
};

// [PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        await Role.updateOne({
            _id: req.params.id,
            deleted: false
        }, req.body);

        res.redirect(`${systemConfig.systemConfig.prefixAdmin}/roles`);
    } catch (error) {
        console.log(error);
        res.redirect(req.get("referer") || "/");
    }
};

// [GET] /admin/roles/detail/:id
module.exports.detail = async (req, res) => {
    const role = await Role.findOne({
        _id: req.params.id,
        deleted: false
    });
    res.render("admin/page/role/detail", {
        titlePage: role.name,
        role: role
    });
};

// [GET] /admin/roles/permission
module.exports.permission = async (req, res) => {
    const roles = await Role.find({
        deleted: false
    });
    const account = await Account.find({
        deleted: false,
        status: "active"
    });
    res.render("admin/page/role/permission", {
        titlePage: "Phân quyền",
        roles: roles,
        account: account
    });
};

// [PATCH] /admin/roles/permission
module.exports.permissionPatch = async (req, res) => {
    try {
        const permission = JSON.parse(req.body.permission);
        for(const item of permission){
            await Role.updateOne({
                _id: item.id
            }, {
                $set: {
                    permission: item.permission
                }
            });
        }
        req.flash("success", "Cập nhật phân quyền thành công!");
    } catch (error) {
        req.flash("error", "Cập nhật thất bại!");
    }
    res.redirect(req.get("referer") || "/");

};
