const Service = require("../../model/service.model");

const systemConfig = require("../../config/system");
const paginationHelper = require("../../helper/pagination.helper");
const searchHelper = require("../../helper/search.helper");
const filterStatusHelper = require("../../helper/filterStatus.helper");

// [GET] /admin/services
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    }
    // Lọc theo trạng thái
    const filter = filterStatusHelper.filterStatus(req.query);
    if (req.query.status) {
        find.status = req.query.status;
    }
    //Sắp xếp tiện ích theo tiêu chí
    const sort = {}
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.price = "desc";
    }
    // Tìm kiếm
    const objectSearch = searchHelper.search(req.query);
    if (objectSearch.regex) {
        find.name = objectSearch.regex;
    }
    // Phân trang
    const countService = await Service.countDocuments(find);
    const objectPagination = await paginationHelper.pagination(req.query, countService);
    const service = await Service.find(find)
        .sort(sort)
        .skip(objectPagination.skipRecord)
        .limit(objectPagination.limit);
    res.render("admin/page/service/index", {
        titlePage: "Dịch vụ",
        service: service,
        pagination: objectPagination,
        keyword: objectSearch.keyword,
        filterStatus: filter
    });
}
// [GET] /admin/services/create
module.exports.create = async (req, res) => {
    res.render("admin/page/service/create", {
        titlePage: "Thêm mới dịch vụ",
    });
}
// [POST] /admin/services/create
module.exports.createPost = async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            stock: req.body.stock,
            image: req.body.image,
            status: req.body.status,
            position: req.body.position,
            description: req.body.description,
            price: req.body.price,
        }
        const service = new Service(data);
        await service.save();
        res.redirect(`${systemConfig.systemConfig.prefixAdmin}/services`);
    } catch (error) {
        console.log(error);
        res.redirect(req.get("referer") || "/");
    }
}
// [PATCH] /admin/services/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;
    try {
        switch (status) {
            case "active":
                await Service.updateOne({
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
                await Service.updateOne({
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

}
// [PATCH] /admin/services/change-multi-status
module.exports.changeMultiStatus = async (req, res) => {
    const ids = req.body.ids.split(", ");
    const status = req.body.status;

    try {
        switch (status) {
            case "active":
                await Service.updateMany({
                    _id: ids
                }, { status: "active" });
                req.flash("success", `Thay đổi trạng thái ${ids.length} tiện ích thành công thành công!`);

                break;
            case "inactive":
                await Service.updateMany({
                    _id: ids
                }, { status: "inactive" });
                req.flash("success", `Thay đổi trạng thái ${ids.length} tiện ích thành công thành công!`);
                break;
            case "delete-all":
                await Service.updateMany({
                    _id: ids
                }, { deleted: true });
                req.flash("success", `Xóa thành công ${ids.length} tiện ích thành công thành công!`);
                break;
            case "position":
                for (const item of ids) {
                    let [id, newposition] = item.split("-");
                    newposition = parseInt(newposition);
                    await Service.updateOne({
                        _id: id
                    }, { position: newposition });
                    req.flash("success", `Thay đổi vị trí ${ids.length} tiện ích thành công thành công!`);
                }

                break;
            default:
                break;
        }
    } catch (error) {
        console.log(error);
    }

    res.redirect(req.get("referer") || "/");
}
// [DELETE] /admin/services/delete/:id
module.exports.deleteService = async (req, res) => {
    const id = req.params.id;
    await Service.updateOne({
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
}
// [GET] /admin/services/edit/:id
module.exports.edit = async (req, res) => {
    const service = await Service.findOne({
        _id: req.params.id,
        deleted: false
    });
    res.render("admin/page/Service/edit", {
        titlePage: "Chỉnh sửa dịch vụ",
        service: service
    });
}
// [PATCH] /admin/services/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        await Service.updateOne({
            _id: req.params.id,
            deleted: false
        }, req.body);

        res.redirect(`${systemConfig.systemConfig.prefixAdmin}/services`);
    } catch (error) {
        console.log(error);
        res.redirect(req.get("referer") || "/");
    }
}
// [GET] /admin/fields/detail/:id
module.exports.detail = async (req, res) => {
    const service = await Service.findOne({
        _id: req.params.id,
        deleted: false
    });
    res.render("admin/page/service/detail", {
        titlePage: service.name,
        service: service
    });
}