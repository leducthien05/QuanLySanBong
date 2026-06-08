const User = require("../../model/user.model");
const Field = require("../../model/field.model");
const Booking = require("../../model/booking.model");
const Favorite = require("../../model/field-favorite.model");
const Review = require("../../model/review.model");

// [GET] /user/info
module.exports.info = async (req, res) => {
    // Lịch sử đặt sân
    const bookingHistory = await Booking.find({
        deleted: false,
        status: { $ne: "pending" }
    });
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

    res.render("client/page/user/info", {
        titlePage: "Thông tin",
        booking: bookingHistory,
        favorite: fieldFavorite,
        amount: totalAmount,
        review: review
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
        address: dataUser.address
    }

    if(req.body.avatar){
        data.avatar = req.body.avatar;
    }

    await User.updateOne({
        _id: req.user.id,
        deleted: false,
        status: "active"
    }, data);
    res.redirect("/user/info");
}