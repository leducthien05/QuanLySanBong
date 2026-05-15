const Field = require("../../model/field.model");
const Pricing = require("../../model/pricing.model");

const systemConfig = require("../../config/system");
const paginationHelper = require("../../helper/pagination.helper");
const searchHelper = require("../../helper/search.helper");
const filterStatusHelper = require("../../helper/filterStatus.helper");

// [GET] /admin/fields
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    }
    // Lọc theo trạng thái
    const filter = filterStatusHelper.filterStatus(req.query);
    if (req.query.status) {
        find.status = req.query.status;
    }
    //Sắp xếp sản phẩm theo tiêu chí
    const sort = {}
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.price = "desc";
    }
    // Tìm kiếm sân
    const objectSearch = searchHelper.search(req.query);
    if (objectSearch.regex) {
        find.name = objectSearch.regex;
    }
    // Phân trang
    const countField = await Field.countDocuments(find);
    const objectPagination = await paginationHelper.pagination(req.query, countField);
    const field = await Field.find(find).sort(sort).skip(objectPagination.skipRecord).limit(objectPagination.limit);
    res.render("admin/page/field/index", {
        titlePage: "Quản lý sân",
        field: field,
        pagination: objectPagination,
        keyword: objectSearch.keyword,
        filterStatus: filter
    });
}
// [GET] /admin/fields/create
module.exports.create = async (req, res) => {
    const timeactive = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'];
    const day = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    res.render("admin/page/field/create", {
        titlePage: "Thêm sân bóng mới",
        timeactive: timeactive,
        days: day
    });
}
// [POST] /admin/fields/create
module.exports.createPost = async (req, res) => {
    //Lưu sân mới
    const [openTime, closeTime] = req.body.timeactive.split("-");
    const dataField = {
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        size: req.body.size,
        grasstype: req.body.grasstype,
        timeactive: {
            openTime: openTime,
            closeTime: closeTime,
            slotDuration: 60
        },
        service: req.body.service,
        price: {
            price: req.body.price,
            priceVip: req.body.priceVip
        },
        address: {
            titleAddress: req.body.titleAddress,
            googleMapUrl: req.body.googleMapUrl
        },
        image: req.body.image,
        status: req.body.status
    }
    if (req.body.position) {
        dataField.position = parseInt(req.body.position);
    } else {
        const count = await Field.countDocuments({ deleted: false });
        dataField.position = count + 1;
    }
    const field = new Field(dataField);
    await field.save();
    // Lưu pricing
    const listPricing = [];
    req.body.schedule.forEach(item => {
        const [day, time] = item.split("-");

        const hour = parseInt(time.split(":")[0]);
        const endHour = `${String(hour + 1).padStart(2, "0")}:00`;
        let price = parseInt(req.body.price);
        let priceVip = parseInt(req.body.priceVip);
        const schedule = {
            field_id: field.id,
            day_of_week: day,
            start_time: time,
            end_time: endHour,
            feature: "0"
        }
        if (hour > 19 && hour < 23) {
            schedule.feature = "1"
            schedule.price = priceVip
        } else {
            schedule.feature = "0"
            schedule.price = price
        }
        listPricing.push(schedule);
    });
    await Pricing.insertMany(listPricing);//Tạo nhiều bản ghi một lúc
    res.redirect(`${systemConfig.systemConfig.prefixAdmin}/fields`);
}
// [PATCH] /admin/fields/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;
    try {
        switch (status) {
            case "active":
                await Field.updateOne({
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
                await Field.updateOne({
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
// [PATCH] /admin/fields/change-multi-status
module.exports.changeMultiStatus = async (req, res) => {
    const ids = req.body.ids.split(", ");
    const status = req.body.status;

    try {
        switch (status) {
            case "active":
                await Field.updateMany({
                    _id: ids
                }, { status: "active" });
                // req.flash("success", `Thay đổi trạng thái ${ids.length} sản phẩm thành công thành công!`);

                break;
            case "inactive":
                await Field.updateMany({
                    _id: ids
                }, { status: "inactive" });
                // req.flash("success", `Thay đổi trạng thái ${ids.length} sản phẩm thành công thành công!`);
                break;
            case "delete-all":
                await Field.updateMany({
                    _id: ids
                }, { deleted: true });
                // req.flash("success", `Xóa thành công ${ids.length} sản phẩm thành công thành công!`);
                break;
            case "position":
                for (const item of ids) {
                    let [id, newposition] = item.split("-");
                    newposition = parseInt(newposition);
                    await Field.updateOne({
                        _id: id
                    }, { position: newposition });
                    // req.flash("success", `Thay đổi vị trí ${ids.length} sản phẩm thành công thành công!`);
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
// [DELETE] /admin/fields/delete/:id
module.exports.deleteField = async (req, res) => {
    const id = req.params.id;
    await Field.updateOne({
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
// [GET] /admin/fields/edit/:id
module.exports.edit = async (req, res) => {
    const timeactive = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'];
    const day = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const field = await Field.findOne({
        _id: req.params.id,
        deleted: false
    });
    const pricing = await Pricing.find({
        field_id: req.params.id,
        deleted: false
    });
    const time = pricing.map(item => {
        return `${item.day_of_week}-${item.start_time}`
    });
    res.render("admin/page/field/edit", {
        titlePage: "Chỉnh sửa sân bóng",
        pricing: time,
        days: day,
        timeactive: timeactive,
        field: field
    });
}
// [PATCH] /admin/fields/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        if (!req.body.service) {
            req.body.service = [];
        }
        req.body.price = {
            price: req.body.price,
            priceVip: req.body.priceVip
        }
        const field = await Field.findOneAndUpdate({
            _id: req.params.id,
            deleted: false
        }, req.body);

        await Pricing.deleteMany({
            field_id: req.params.id,
        });
        // Cập nhật Pricing
        let schedules = req.body.schedule || [];

        if (!Array.isArray(schedules)) {
            schedules = [schedules];
        }
        const listPricing = [];
        schedules.forEach(item => {
            const [day, time] = item.split("-");

            const hour = parseInt(time.split(":")[0]);
            const endHour = `${String(hour + 1).padStart(2, "0")}:00`;
            let price = parseInt(field.price.price);
            let priceVip = parseInt(field.price.priceVip);
            const schedule = {
                field_id: field.id,
                day_of_week: day,
                start_time: time,
                end_time: endHour,
                feature: "0"
            }
            if (hour > 19 && hour < 23) {
                schedule.feature = "1"
                schedule.price = priceVip
            } else {
                schedule.feature = "0"
                schedule.price = price
            }
            listPricing.push(schedule);
        });
        await Pricing.insertMany(listPricing);

        res.redirect(req.get("referer") || "/");
    } catch (error) {
        console.log(error);
        res.redirect(req.get("referer") || "/");
    }
}