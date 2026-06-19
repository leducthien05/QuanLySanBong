const Refund = require("../../model/refund.model");
const Account = require("../../model/account.model");
const User = require("../../model/user.model");

const systemConfig = require("../../config/system");
const paginationHelper = require("../../helper/pagination.helper");
const searchHelper = require("../../helper/search.helper");
const filterStatusHelper = require("../../helper/filterStatus.helper");
const Booking = require("../../model/booking.model");

// [GET] /admin/refunds
module.exports.index = async (req, res) => {
    try {
        const find = {
            deleted: false
        }
        const filter = filterStatusHelper.filterStatus(req.query);
        if (req.query.status) {
            if (req.query.status == "active") {
                find.status = "pending";
            } else if (req.query.status == "inactive") {
                find.status = "completed"
            }
        }
        const refunds = await Refund.find(find)
            .populate({
                path: "processingBy"
            })
            .populate({
                path: "user_id",
                select: "userName phone"
            });

        refunds.forEach(item =>{
            item.priceRefund = item.amount * 0.7;
        });
        res.render("admin/page/refund/index", {
            pageTitle: "Quản lý hoàn tiền",
            refunds: refunds,
            filterStatus: filter
        });

    } catch (error) {
        console.log(error);
        res.redirect("back");
    }
};

// [PATCH] /admin/refunds/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.params.status;

        const refund = await Refund.findOne({
            _id: id
        });
        if (!refund) {
            return res.json({
                code: 404,
                message: "Hoàn tiền không tồn tại"
            });
        }

        let updateDate = "";

        if (status === "pending") {
            updateDate = "completed";
        }

        if (status === "completed") {
            updateDate = "pending";
        }

        await Refund.findByIdAndUpdate({
            _id: id
        }, {
            $set: {
                status: updateDate,
                completedBy: res.locals.accountAdmin.id,
                completedAt: new Date()
            }
        });


        res.json({
            code: 200,
            status: updateDate,
            message: "Cập nhật thành công"
        });
    } catch (error) {
        console.error("Error in change status:", error);
        res.json({
            code: 500,
            message: "Cập nhật thất bại"
        });
    }
};
