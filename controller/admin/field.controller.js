const Field = require("../../model/field.model");
const Pricing = require("../../model/pricing.model");

const systemConfig = require("../../config/system");
const paginationHelper = require("../../helper/pagination.helper");
const searchHelper = require("../../helper/search.helper");

// [GET] /admin/fields
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    }
    const objectSearch = searchHelper.search(req.query);
    if(objectSearch.regex){
        find.name = objectSearch.regex;
    }
    const countField = await Field.countDocuments(find);
    const objectPagination = await paginationHelper.pagination(req.query, countField);
    const field = await Field.find(find).skip(objectPagination.skipRecord).limit(objectPagination.limit);
    const price = await Pricing.findOne({
        deleted: false,
        feature: "0"
    });
    const priceVip = await Pricing.findOne({
        deleted: false,
        feature: "1"
    });
    res.render("admin/page/field/index", {
        titlePage: "Sân",
        field: field,
        priceVip: priceVip,
        price: price,
        pagination: objectPagination,
        keyword: objectSearch.keyword
    });
}
// [GET] /admin/fields/create
module.exports.create = async (req, res) => {
    res.render("admin/page/field/create", {
        titlePage: "Thêm sân bóng mới"
    });
}
// [POST] /admin/fields/create
module.exports.createPost = async (req, res) => {
    const dataField = {
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        address: {
            titleAddress: req.body.titleAddress,
            googleMapUrl: req.body.googleMapUrl
        },
        image: req.body.image,
        status: req.body.status
    }
    const field = new Field(dataField);
    await field.save();
    const listPricing = [];
    req.body.schedule.forEach(item => {
        const [day, time] = item.split("-");

        const hour = parseInt(time.split(":")[0]);
        const endHour = `${String(hour + 1).padStart(2, "0")}:00`;
        let price = parseInt(req.body.price);
        const schedule = {
            field_id: field.id,
            day_of_week: day,
            start_time: time,
            end_time: endHour,
            price: price,
            feature: "0"
        }
        if(hour > 19 && hour < 23){
            schedule.price += 100000;
            schedule.feature = "1"
        }
        listPricing.push(schedule);
    });
    await Pricing.insertMany(listPricing);
    res.redirect(`${systemConfig.systemConfig.prefixAdmin}/fields`);
}