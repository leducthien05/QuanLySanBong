const Booking = require("../../model/booking.model");
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
    const objectPagination = await paginationHelper.pagination(req.query, countBooking);
    const booking = await Booking.find(find)
        .sort(sort)
        .skip(objectPagination.skipRecord)
        .limit(objectPagination.limit);

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
    const booking = await Booking.findOne({
        _id: req.params.id,
        deleted: false
    });
    res.render("admin/page/booking/detail", {
        titlePage: `Chi tiết đặt sân #${booking ? booking._id : ""}`,
        booking: booking
    });
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
