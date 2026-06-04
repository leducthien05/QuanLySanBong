const Field = require("../../model/field.model");
const Service = require("../../model/service.model");

const paginationHelper = require("../../helper/pagination.helper");

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

// [GET] /search
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