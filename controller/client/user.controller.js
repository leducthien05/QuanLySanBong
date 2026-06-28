const User = require("../../model/user.model");
const Field = require("../../model/field.model");
const Booking = require("../../model/booking.model");
const Favorite = require("../../model/field-favorite.model");
const Review = require("../../model/review.model");
const Account = require("../../model/account.model");
const Role = require("../../model/role.model");

// [GET] /user/info
module.exports.info = async (req, res) => {
    // Lịch sử đặt sân
    const bookingHistory = await Booking.find({
        deleted: false,
        user_id: req.user.id,
        status: { $ne: "pending" }
    }).sort({ createdAt: -1 });
    const totalAmount = bookingHistory.reduce((sum, item) => {
        return sum + item.totalPrice;
    }, 0);

    let idField = bookingHistory.map(item => item.field_id);
    idField = [...new Set(idField)];
    const fieldHistory = await Field.find({
        deleted: false,
        _id: { $in: idField }
    });
    const fieldMap = {};
    fieldHistory.forEach(item => {
        fieldMap[item.id] = item;
    });
    bookingHistory.forEach(item => {
        item.field = fieldMap[item.field_id];
    });

    // Lấy sân yêu thích
    const idFieldFavorite = await Favorite.find({
        deleted: false,
        user_id: req.user.id,
    }).select("field_id");
    const fieldFavorite = await Field.find({
        deleted: false,
        _id: { $in: idFieldFavorite }
    });

    // Đánh giá của người dùng
    const review = await Review.find({
        deleted: false,
        user_id: req.user.id
    });

    // Người thụ lý hoàn tiền
    const roles = await Role.find({
        permission: "refund_manage"
    });
    const idRole = roles.map(item => item._id);
    const accountRefund = await Account.find({
        deleted: false,
        status: "active",
        role_id: {$in: idRole}
    }).select("fullName displayName");
    res.render("client/page/user/info", {
        titlePage: "Thông tin",
        booking: bookingHistory,
        favorite: fieldFavorite,
        amount: totalAmount,
        review: review,
        accountRefund: accountRefund
    });
}

// [PATCH] /user/info/edit
module.exports.editPatch = async (req, res) => {
    const dataUser = JSON.parse(req.body.infoUser);
    const data = {
        userName: dataUser.userName,
        email: dataUser.email,
        phone: dataUser.phone,
        displayName: dataUser.displayName,
        sex: dataUser.sex,
        address: dataUser.address,
        bankInfo: {
            accountName: dataUser.accountName,
            accountNumber: dataUser.accountNumber,
            bankName: dataUser.bankName
        }
    };

    // Xóa các field rỗng ở cấp 1
    Object.keys(data).forEach(key => {
        if (
            data[key] === "" ||
            data[key] === null ||
            data[key] === undefined
        ) {
            delete data[key];
        }
    });

    // Xóa các field rỗng trong bankInfo
    if (data.bankInfo) {
        Object.keys(data.bankInfo).forEach(key => {
            if (
                data.bankInfo[key] === "" ||
                data.bankInfo[key] === null ||
                data.bankInfo[key] === undefined
            ) {
                delete data.bankInfo[key];
            }
        });

        // Nếu bankInfo không còn thuộc tính nào thì xóa luôn
        if (Object.keys(data.bankInfo).length === 0) {
            delete data.bankInfo;
        }
    }

    await User.updateOne({
        _id: req.user.id,
        deleted: false,
        status: "active"
    }, data);
    res.redirect("/user/info");
}

// [PATCH] /user/bank-refund/edit
module.exports.refund = async (req, res) => {
    try {
        const data = req.body.bankInfo;
        await User.updateOne({
            _id: req.user.id,
            status: "active",
            deleted: false
        }, {
            $set: {
                bankInfo: data
            }
        });
        res.json({
            code: 200
        });
    } catch (error) {
        res.status(400).json({
            message: "Lỗi dữ liệu gửi lên"
        });
    }
}