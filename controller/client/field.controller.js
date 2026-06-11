const Field = require("../../model/field.model");
const Service = require("../../model/service.model");
const Pricing = require("../../model/pricing.model");
const Booking = require("../../model/booking.model");
const Payment = require("../../model/payment.model");
const Review = require("../../model/review.model");
const User = require("../../model/user.model");
const Favorite = require("../../model/field-favorite.model");

const paginationHelper = require("../../helper/pagination.helper");
const pricingHelper = require("../../helper/getPricing.helper");
const ratingHelper = require("../../helper/rating.helper");

// [GET] /field
module.exports.index = async (req, res) => {
    const findField = {
        deleted: false,
        status: "active"
    }

    // Phân trang
    const countField = await Field.countDocuments(findField);
    const objectPagination = await paginationHelper.pagination(req.query, countField);

    const fields = await Field.find(findField).skip(objectPagination.skipRecord).limit(objectPagination.limit);;

    // Lấy danh sách khu vực có sân bóng
    const areaCount = await Field.aggregate([
        {
            $match: {
                deleted: false,
                status: "active"
            }
        },
        {
            $group: {
                _id: "$address.titleAddress",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                title: "$_id",
                count: 1
            }
        }
    ]);

    // Lấy loại sân
    const typeField = await Field.distinct("type", {
        deleted: false,
        status: "active"
    });

    // Tổng số sâng bóng
    const totalField = await Field.countDocuments({
        deleted: false,
        status: "active"
    });

    // Dịch vụ
    const services = await Service.find({
        deleted: false,
        status: "active"
    }).select("name price");

    res.render("client/page/field/index", {
        title: "Danh sách sân bóng",
        fields: fields,
        area: areaCount,
        totalArea: totalField,
        typeField: typeField,
        services: services,
        pagination: objectPagination
    });
}

// [GET] /field/search
module.exports.search = async (req, res) => {
    try {
        const find = {
            deleted: false,
            status: "active"
        };


        // Tìm kiếm theo loại sân
        if (req.query.type) {
            find.type = req.query.type
        }

        // Sắp xếp theo tiêu chí
        let sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            if (req.query.sortKey == "price") {
                sort["price.price"] = req.query.sortValue;
            } else {
                sort[req.query.sortKey] = req.query.sortValue;
            }
        } else {
            sort["price.price"] = "asc";
        }


        // Tìm kiếm theo tên
        if (req.query.keyword) {
            find.name = {
                $regex: req.query.keyword,
                $options: "i"
            };
            const fields = await Field.find(find);
            return res.json({
                success: true,
                data: fields
            });
        }

        // Phân trang
        const countField = await Field.countDocuments(find);
        const objectPagination = await paginationHelper.pagination(req.query, countField);

        const fields = await Field.find(find).sort(sort).skip(objectPagination.skipRecord).limit(objectPagination.limit);;

        res.json({
            success: true,
            data: fields
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// [GET] /field/detail/:slug
module.exports.detail = async (req, res) => {
    try {
        const { slug } = req.params;

        // Fetch the field by slug
        const field = await Field.findOne({
            slug: slug,
            deleted: false,
            status: 'active'
        });

        if (!field) {
            return res.render('client/page/404', {
                pageTitle: 'Sân bóng không tồn tại'
            });
        }

        // Dịch vụ
        const idService = field.service.map(item => item);
        const service = await Service.find({
            deleted: false,
            status: "status",
            _id: { $in: idService }
        });

        // Lịch giờ
        const date = new Date().toISOString().split("T")[0]
        const pricing = await pricingHelper.getPricing(date, field.id);

        // Phương thức thanh toán
        const payment = await Payment.find({
            status: "active"
        });

        // Đánh giá
        const review = await Review.find({
            field_id: field.id
        });
        // lấy danh sách user_id từ review
        const idUser = review.map(item => item.user_id);

        // lấy user
        const user = await User.find({
            _id: { $in: idUser }
        }).select("userName avatar address");

        // map user theo _id
        const userMap = {};
        user.forEach(item => {
            userMap[item._id] = item;
        });

        // gắn user vào review
        review.forEach(item => {
            item.user = userMap[item.user_id];
        });

        // Bảng đánh giá của người dùng
        const ratingField = ratingHelper.rating(review);

        // Sân yêu thích
        const fieldFavorite = await Favorite.findOne({
            deleted: false,
            user_id: req.user.id,
            field_id: field.id
        });
        let record = false;
        if(fieldFavorite){
            record = true;
        } else{
            record = false
        }
        // Render the detail page
        res.render('client/page/field/detail', {
            pageTitle: `${field.name} | Đặt Sân Bóng`,
            field: field,
            service: service,
            pricing: pricing.pricing,
            payment: payment,
            reviews: review,
            ratingField: ratingField,
            favorite: record
        });

    } catch (error) {
        console.error('Error in field detail:', error);
        res.status(500).render('client/page/500', {
            pageTitle: 'Lỗi Server'
        });
    }
};

// [GET] /field/pricing/:slug
module.exports.pricing = async (req, res) => {
    const slug = req.params.slug;
    const field = await Field.findOne({
        deleted: false,
        status: "active",
        slug: slug
    });
    let date = req.query.date;
    if (date) {
        const pricing = await pricingHelper.getPricing(date, field.id);
        return res.json(pricing);
    } else {
        date = new Date().toISOString().split("T")[0]
        const pricing = await pricingHelper.getPricing(date, field.id);
        return res.json(pricing);
    }
}

// [GET] /field/favorite/:status/:id
module.exports.favorite = async (req, res) => {
    const id = req.params.id;
    let status = req.params.status;
    const field = await Field.findOne({
        deleted: false,
        _id: id
    });
    if (!field) {
        res.status(404).json({
            message: "Sân không tồn tại hoặc đang bảo trì"
        });
    }
    if (status == "inactive") {
        status = "active";
        const data = {
            user_id: req.user.id,
            field_id: id
        };
        await Favorite.create(data);
    } else if (status == "active") {
        status = "inactive"
        await Favorite.findOneAndDelete({
            user_id: req.user.id,
            field_id: id
        });
    }

    res.status(200).json({
        message: "Thành công",
        status: status
    });
}