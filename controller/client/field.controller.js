const Field = require("../../model/field.model");
const Service = require("../../model/service.model");
const Pricing = require("../../model/pricing.model");
const Booking = require("../../model/booking.model");
const Payment = require("../../model/payment.model");
const Review = require("../../model/review.model");
const User = require("../../model/user.model");

const paginationHelper = require("../../helper/pagination.helper");
const pricingHelper = require("../../helper/getPricing.helper");

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

        // Đánh giá số sao
        const stats = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };

        review.forEach(item => {
            stats[item.rating]++;
        });

        const totalReview = review.length;

        const percent = {
            1: totalReview ? (stats[1] / totalReview) * 100 : 0,
            2: totalReview ? (stats[2] / totalReview) * 100 : 0,
            3: totalReview ? (stats[3] / totalReview) * 100 : 0,
            4: totalReview ? (stats[4] / totalReview) * 100 : 0,
            5: totalReview ? (stats[5] / totalReview) * 100 : 0,
        };
        const avgRating = totalReview ? (review.reduce((sum, item) => sum + item.rating, 0) / totalReview).toFixed(1) : "0.0";
        // Render the detail page
        res.render('client/page/field/detail', {
            pageTitle: `${field.name} | Đặt Sân Bóng`,
            field: field,
            service: service,
            pricing: pricing.pricing,
            payment: payment,
            reviews: review,
            totalReview: totalReview,
            stats: stats,
            percent: percent,
            avgRating: avgRating
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