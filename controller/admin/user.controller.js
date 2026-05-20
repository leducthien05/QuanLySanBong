const User = require("../../model/user.model");

const systemConfig = require("../../config/system");
const paginationHelper = require("../../helper/pagination.helper");
const searchHelper = require("../../helper/search.helper");
const filterStatusHelper = require("../../helper/filterStatus.helper");

// [GET] /admin/users
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
            { userName: objectSearch.regex },
            { email: objectSearch.regex }
        ];
    }

    const countUser = await User.countDocuments(find);
    const objectPagination = await paginationHelper.pagination(req.query, countUser);
    const user = await User.find(find)
        .sort(sort)
        .skip(objectPagination.skipRecord)
        .limit(objectPagination.limit);

    res.render("admin/page/user/index", {
        titlePage: "Người dùng",
        user: user,
        pagination: objectPagination,
        keyword: objectSearch.keyword,
        filterStatus: filter
    });
};

// [GET] /admin/users/create
module.exports.create = async (req, res) => {
    res.render("admin/page/user/create", {
        titlePage: "Thêm mới người dùng"
    });
};

// [POST] /admin/users/create
module.exports.createPost = async (req, res) => {
    try {
        const data = {
            userName: req.body.userName,
            phone: req.body.phone,
            email: req.body.email,
            password: req.body.password,
            avatar: req.body.avatar,
            status: req.body.status
        };
        const user = new User(data);
        await user.save();
        res.redirect(`${systemConfig.systemConfig.prefixAdmin}/users`);
    } catch (error) {
        console.log(error);
        res.redirect(req.get("referer") || "/");
    }
};

// [PATCH] /admin/users/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;
    try {
        switch (status) {
            case "active":
                await User.updateOne({
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
                await User.updateOne({
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

// [PATCH] /admin/users/change-multi-status
module.exports.changeMultiStatus = async (req, res) => {
    const ids = req.body.ids.split(", ");
    const status = req.body.status;

    try {
        switch (status) {
            case "active":
                await User.updateMany({
                    _id: ids
                }, { status: "active" });
                req.flash("success", `Thay đổi trạng thái ${ids.length} người dùng thành công!`);
                break;
            case "inactive":
                await User.updateMany({
                    _id: ids
                }, { status: "inactive" });
                req.flash("success", `Thay đổi trạng thái ${ids.length} người dùng thành công!`);
                break;
            case "delete-all":
                await User.updateMany({
                    _id: ids
                }, { deleted: true });
                req.flash("success", `Xóa thành công ${ids.length} người dùng!`);
                break;
            default:
                break;
        }
    } catch (error) {
        console.log(error);
    }

    res.redirect(req.get("referer") || "/");
};

// [DELETE] /admin/users/delete/:id
module.exports.deleteUser = async (req, res) => {
    const id = req.params.id;
    await User.updateOne({
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

// [GET] /admin/users/edit/:id
module.exports.edit = async (req, res) => {
    const user = await User.findOne({
        _id: req.params.id,
        deleted: false
    });
    res.render("admin/page/user/edit", {
        titlePage: "Chỉnh sửa người dùng",
        user: user
    });
};

// [PATCH] /admin/users/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (!updateData.password) {
            delete updateData.password;
        }
        await User.updateOne({
            _id: req.params.id,
            deleted: false
        }, updateData);

        res.redirect(`${systemConfig.systemConfig.prefixAdmin}/users`);
    } catch (error) {
        console.log(error);
        res.redirect(req.get("referer") || "/");
    }
};

// [GET] /admin/users/detail/:id
module.exports.detail = async (req, res) => {
    const user = await User.findOne({
        _id: req.params.id,
        deleted: false
    });
    res.render("admin/page/user/detail", {
        titlePage: user.userName,
        user: user
    });
};
