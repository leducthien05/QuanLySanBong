const Booking = require("../../model/booking.model");
const Field = require("../../model/field.model");
const Service = require("../../model/service.model");
const Pricing = require("../../model/pricing.model");

// [GET] /booking
module.exports.index = async (req, res) => {
    const find = {
        deleted: false,
        status: "active"
    }
    const fields = await Field.find(find);
    const address = fields.map(item => {
        const titleAddress = item.address.titleAddress;
        const currentAddress = titleAddress.split(",").at(-2).trim();
        return currentAddress;
    });
    const uniqueAddresses = [...new Set(address)];
    const pricings = await Pricing.find({ deleted: false });
    const services = await Service.find(find);
    res.render("client/page/booking/index", {
        pageTitle: "Đặt Sân Bóng - Quản Lý Sân Bóng",
        fields: fields,
        services: services,
        pricings: pricings,
        address: uniqueAddresses
    });
}

// [GET] /booking/filter
module.exports.filter = async (req, res) => {
    const find = {
        deleted: false,
        status: "active"
    };
    if (req.query.type) {
        find.type = req.query.type;
    }
    if (req.query.address) {
        find["address.titleAddress"] = new RegExp(req.query.address, "i");
    }
    const fields = await Field.find(find);

    res.status(200).json({
        fields: fields
    });
}

// [GET] /booking/field/:id
module.exports.getField = async (req, res) => {
    const date = req.query.date;
    const dayOfWeek = new Date(date).getDay();
    let pricing;
    switch (dayOfWeek) {
        case 0:
            pricing = await Pricing.find({
                deleted: false,
                field_id: req.params.id,
                day_of_week: "Monday"
            });
            break;
        case 2: 
            pricing = await Pricing.find({
                deleted: false,
                field_id: req.params.id,
                day_of_week: "Tuesday"
            });
            break;
        case 3:
            pricing = await Pricing.find({
                deleted: false,
                field_id: req.params.id,
                day_of_week: "Wednesday"
            });
            break;  
        case 4:
            pricing = await Pricing.find({
                deleted: false,
                field_id: req.params.id,
                day_of_week: "Thursday"
            });
            break;
        case 5:
            pricing = await Pricing.find({
                deleted: false,
                field_id: req.params.id,
                day_of_week: "Friday"
            });
            break;
        case 6:
            pricing = await Pricing.find({
                deleted: false,
                field_id: req.params.id,
                day_of_week: "Saturday"
            });
            break;  
        default:
            break;
    }
    const idPricing = pricing.map(item => item.id);
    const bookings = await Booking.find({
        deleted: false,
        field_id: req.params.id,
        pricing_id: { $in: idPricing },
        date: new Date(date)
    });
    const bookingMap = {};
    bookings.forEach(item =>{
        bookingMap[item.pricing_id] = "booked";
    });
    pricing.forEach(item =>{
        if(bookingMap[item.id]){
            item.status = "booked";
        }
    });
    res.status(200).json({
        pricings: pricing,
        date: date
    });
}

