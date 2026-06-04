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
    res.render("admin/page/field/create", {
        titlePage: "Thêm sân bóng mới",
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
            titleAddress: req.body.titleAddress.trim(),
            googleMapUrl: req.body.googleMapUrl.trim()
        },
        image: req.body.image,
        status: req.body.status
    }
    if (req.body.feature) {
        dataField.featured = req.body.feature;
    }
    if (req.body.position) {
        dataField.position = parseInt(req.body.position);
    } else {
        const count = await Field.countDocuments({ deleted: false });
        dataField.position = count + 1;
    }
    const field = new Field(dataField);
    await field.save();
    const slot = [];
    if (openTime && closeTime) {
        // Tạo các slot thời gian
        const toMinuters = (time) => {
            const [hour, minute] = time.split(":").map(Number);
            return hour * 60 + minute;
        }
        let currentTime = openTime;
        while (toMinuters(currentTime) < toMinuters(closeTime)) {
            slot.push(currentTime);
            // Tính thời gian kết thúc của slot hiện tại
            const [hour, minute] = currentTime.split(":").map(Number);
            let nextHour = hour;
            let nextMinute = minute + field.timeactive.slotDuration;
            if (nextMinute >= 60) {
                nextHour += Math.floor(nextMinute / 60);
                nextMinute = nextMinute % 60 + 15;
            }
            if (nextHour >= 24) {
                nextHour = nextHour % 24;
            }
            currentTime = `${nextHour.toString().padStart(2, "0")}:${nextMinute.toString().padStart(2, "0")}`;
        }
        console.log(slot);
        // Lưu thông tin giá cho từng slot thời gian
        const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let schedules = [];
        dayOfWeek.forEach(day => {
            const daySchedules = slot.map(time => {
                const [hour, minute] = time.split(":").map(Number);
                if (day === "Saturday" || day === "Sunday") {
                    return {
                        field_id: field._id,
                        day_of_week: day,
                        start_time: time,
                        feature: "1",
                        price: field.price.priceVip
                    }
                } else {
                    if (hour >= 18 && hour <= 24) {
                        return {
                            field_id: field._id,
                            day_of_week: day,
                            start_time: time,
                            feature: "1",
                            price: field.price.priceVip
                        }
                    }
                    else {
                        return {
                            field_id: field._id,
                            day_of_week: day,
                            start_time: time,
                            feature: "0",
                            price: field.price.price
                        }
                    }
                }
            });
            schedules.push(...daySchedules);
        });
        await Pricing.insertMany(schedules);
    }
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
    const field = await Field.findOne({
        _id: req.params.id,
        deleted: false
    });
    res.render("admin/page/field/edit", {
        titlePage: "Chỉnh sửa sân bóng",
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
        req.body.address = {
            titleAddress: req.body.titleAddress.trim(),
            googleMapUrl: req.body.googleMapUrl.trim()
        }

        req.body.timeactive = {
            openTime: req.body.timeactive.split("-")[0],
            closeTime: req.body.timeactive.split("-")[1],
            slotDuration: 60
        }
        const field = await Field.findOneAndUpdate({
            _id: req.params.id,
            deleted: false
        }, req.body, {
            returnDocument: "after"
        });
        const slot = [];
        if (req.body.timeactive) {
            const openTime = req.body.timeactive.openTime;
            const closeTime = req.body.timeactive.closeTime;
            if (openTime && closeTime) {
                const toMinuters = (tiem) => {
                    const [hour, minute] = tiem.split(":").map(Number);
                    return hour * 60 + minute;
                }
                let currentTime = openTime;
                while (toMinuters(currentTime) <= toMinuters(closeTime)) {
                    slot.push(currentTime);
                    // Tính thời gian kết thúc của slot hiện tại
                    const [hour, minute] = currentTime.split(":").map(Number);
                    let nextHour = hour;
                    let nextMinute = minute + field.timeactive.slotDuration;
                    if (nextMinute >= 60) {
                        nextHour += Math.floor(nextMinute / 60);
                        nextMinute = nextMinute % 60;
                    }
                    console.log(field.timeactive.slotDuration)
                    currentTime = `${nextHour.toString().padStart(2, "0")}:${nextMinute.toString().padStart(2, "0")}`;
                }
                // Lưu thông tin giá cho từng slot thời gian
                const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                let schedules = [];
                dayOfWeek.forEach(day => {
                    const daySchedules = slot.map(time => {
                        const [hour, minute] = time.split(":").map(Number);
                        if (day === "Saturday" || day === "Sunday") {
                            return {
                                field_id: field._id,
                                day_of_week: day,
                                start_time: time,
                                feature: "1",
                                price: field.price.priceVip
                            }
                        } else {
                            if (hour >= 18 && hour <= 24) {
                                return {
                                    field_id: field._id,
                                    day_of_week: day,
                                    start_time: time,
                                    feature: "1",
                                    price: field.price.priceVip
                                }
                            }
                            else {
                                return {
                                    field_id: field._id,
                                    day_of_week: day,
                                    start_time: time,
                                    feature: "0",
                                    price: field.price.price
                                }
                            }
                        }
                    });
                    schedules.push(...daySchedules);
                });
                await Pricing.deleteMany({ field_id: req.params.id });
                await Pricing.insertMany(schedules);
            }
        } else {
            await Pricing.deleteMany({ field_id: req.params.id });
        }
        res.redirect(req.get("referer") || "/");
    } catch (error) {
        console.log(error);
        res.redirect(req.get("referer") || "/");
    }
}
// [GET] /admin/fields/detail/:id
module.exports.detail = async (req, res) => {
    const field = await Field.findOne({
        _id: req.params.id,
        deleted: false
    });
    res.render("admin/page/field/detail", {
        titlePage: field.name,
        field: field
    });
}