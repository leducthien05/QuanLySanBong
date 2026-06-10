const Booking = require("../../model/booking.model");
const User = require("../../model/user.model");
const Field = require("../../model/field.model");
const Service = require("../../model/service.model");
const Pricing = require("../../model/pricing.model");

const systemConfig = require("../../config/system");
const paginationHelper = require("../../helper/pagination.helper");
const searchHelper = require("../../helper/search.helper");
const filterStatusHelper = require("../../helper/filterStatus.helper");

// [GET] /admin/bookings
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    };

    // Lọc theo trạng thái
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
            { node: objectSearch.regex },
            { user_id: objectSearch.regex },
            { field_id: objectSearch.regex }
        ];
    }

    const countBooking = await Booking.countDocuments(find);

    const objectPagination = await paginationHelper.pagination(
        req.query,
        countBooking
    );

    let booking = await Booking.find(find)
        .sort(sort)
        .skip(objectPagination.skipRecord)
        .limit(objectPagination.limit);

    // ======================
    // Lấy thông tin User
    // ======================

    const userIds = booking.map(item => item.user_id);

    const users = await User.find({
        _id: { $in: userIds }
    }).select("userName phone");

    const userMap = {};

    users.forEach(item => {
        userMap[item.id] = item;
    });

    // ======================
    // Lấy thông tin Sân
    // ======================

    const fieldIds = booking.map(item => item.field_id);

    const fields = await Field.find({
        _id: { $in: fieldIds }
    }).select("name");

    const fieldMap = {};

    fields.forEach(item => {
        fieldMap[item.id] = item;
    });

    // ======================
    // Gắn dữ liệu
    // ======================

    booking = booking.map(item => {
        item = item.toObject();

        item.userInfo = userMap[item.user_id];
        item.fieldInfo = fieldMap[item.field_id];
        return item;
    });

    res.render("admin/page/booking/index", {
        titlePage: "Đặt sân",
        booking: booking,
        pagination: objectPagination,
        keyword: objectSearch.keyword,
        filterStatus: filter
    });
};

// [GET] /admin/bookings/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;

        const booking = await Booking.findOne({
            _id: id,
            deleted: false
        });

        if (!booking) {
            req.flash("error", "Không tìm thấy đơn đặt sân!");
            return res.redirect(`${prefixAdmin}/bookings`);
        }

        const bookingObject = booking.toObject();

        // Lấy thông tin người đặt
        const user = await User.findOne({
            _id: booking.user_id
        }).select("fullName email phone");

        // Lấy thông tin sân
        const field = await Field.findOne({
            _id: booking.field_id
        }).select("name");

        bookingObject.userInfo = user;
        bookingObject.fieldInfo = field;

        res.render("admin/page/booking/detail", {
            titlePage: "Chi tiết đặt sân",
            booking: bookingObject
        });

    } catch (error) {
        console.log(error);

        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${prefixAdmin}/bookings`);
    }
};

// [DELETE] /admin/bookings/delete/:id
module.exports.deleteBooking = async (req, res) => {
    const id = req.params.id;
    await Booking.updateOne({
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
