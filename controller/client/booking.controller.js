const Booking = require("../../model/booking.model");
const Field = require("../../model/field.model");
const Service = require("../../model/service.model");
const Pricing = require("../../model/pricing.model");
const Payment = require("../../model/payment.model");

const paymentHelper = require("../../helper/payment.helper");

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
    const payment = await Payment.find({
        status: "active"
    });
    res.render("client/page/booking/index", {
        pageTitle: "Đặt Sân Bóng - Quản Lý Sân Bóng",
        fields: fields,
        services: services,
        pricings: pricings,
        address: uniqueAddresses,
        payment: payment
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
                day_of_week: "Sunday"
            }).lean();
            break;
        case 1:
            pricing = await Pricing.find({
                deleted: false,
                field_id: req.params.id,
                day_of_week: "Monday"
            }).lean();
            break;
        case 2:
            pricing = await Pricing.find({
                deleted: false,
                field_id: req.params.id,
                day_of_week: "Tuesday"
            }).lean();
            break;
        case 3:
            pricing = await Pricing.find({
                deleted: false,
                field_id: req.params.id,
                day_of_week: "Wednesday"
            }).lean();
            break;
        case 4:
            pricing = await Pricing.find({
                deleted: false,
                field_id: req.params.id,
                day_of_week: "Thursday"
            }).lean();
            break;
        case 5:
            pricing = await Pricing.find({
                deleted: false,
                field_id: req.params.id,
                day_of_week: "Friday"
            }).lean();
            break;
        case 6:
            pricing = await Pricing.find({
                deleted: false,
                field_id: req.params.id,
                day_of_week: "Saturday"
            }).lean();
            break;
        default:
            break;
    }
    const idPricing = pricing.map(item => item.id);
    const bookings = await Booking.find({
        deleted: false,
        field_id: req.params.id,
        status: "paid",
        date: new Date(date)
    });
    const bookingMap = {};

    bookings.forEach(item => {
        item.pricing.forEach(slot => {
            bookingMap[slot.id.toString()] = true;
        });
    });

    pricing.forEach(item => {
        if (bookingMap[item._id.toString()]) {
            item.booked = '1';
        }
    });
    pricing.forEach(item => {
        if (item.booked) {
            console.log(item.booked)
        }
    });
    res.status(200).json({
        pricings: pricing,
        date: date
    });
}

// [POST] /booking/payment
module.exports.payment = async (req, res) => {
    // Chuyển data sang Object
    const data = JSON.parse(req.body.bookingData);
    
    // Lấy danh sách id và update trạng thái của pricing
    const idPricing = data.pricing.map(item => item.pricing_id);
    console.log(data)
    const dataPricing = await Pricing.find({
        deleted: false,
        _id: { $in: idPricing },
        status: "active"
    });
    const exists = await Booking.findOne({
        deleted: false,
        field_id: data.field_id,
        date: new Date(data.date),
        status: "paid",
        // kiểm tra có phần tử nào trùng
        "pricing.id": { $in: idPricing }
    });

    if (exists) {
        return res.status(400).json({
            message: "Có slot đã được đặt"
        });
    }
    // Tính tổng giá tiền
    const totalPricePricing = dataPricing.reduce((sum, item) => {
        return sum + item.price;
    }, 0);
    // Tạo mảng pricing
    let pricing = [];
    dataPricing.forEach(item => {
        const record = {
            id: item.id,
            time: item.start_time,
            type: item.feature,
            price: item.price
        }
        pricing.push(record);
    });

    // Lấy id và danh sách dịch vụ kèm theo
    const idService = data.service.map(item => item.service_id);
    const dataService = await Service.find({
        _id: { $in: idService },
        status: "active",
        deleted: false
    });
    const totalPriceService = dataService.reduce((sum, item) => {
        return sum + item.price;
    }, 0);
    let service = [];
    dataService.map(item => {
        const record = {
            id: item._id,
            name: item.name,
            price: item.price
        }
        service.push(record);
    });
    
    // Tổng tiền booking 
    const totalPrice = totalPricePricing + totalPriceService;


    // Khóa booking khi thanh toán
    const existingOrder = await Booking.findOne({
        field_id: data.field_id,
        user_id: "",
        pricing: pricing,
        date: data.date,
        totalPrice: totalPrice,
        node: data.node,
        paymentMethod: data.payment,
        service: service,
        status: "pending"
    });

    if (existingOrder) {
        // ==============================
        // 💳 THANH TOÁN MOMO
        // ==============================   
        if(data.namePayment === "vnpay") {
            const url = await paymentHelper.vnpay(existingOrder.id, existingOrder.totalPrice);
            return res.redirect(url);
        }

        // ==============================
        // 💳 THANH TOÁN TIỀN MẶT
        // ==============================
        if (data.namePayment === "cash") {
            const deposit = existingOrder.totalPrice * (30 / 100);
            const url = await paymentHelper.vnpay(existingOrder.id, deposit);
            return res.redirect(url);
        }

        // ==============================
        // 💳 THANH TOÁN MOMO
        // ==============================
        if (data.namePayment === "momo") {
            const url = await paymentHelper.momo(res, existingOrder.id, existingOrder.totalPrice);
            return res.redirect(url);
        }
    }
    // Tạo booking
    const dataBooking = new Booking({
        field_id: data.field_id,
        user_id: "",
        pricing: pricing,
        date: data.date,
        totalPrice: totalPrice,
        node: data.node,
        paymentMethod: data.payment,
        service: service,
        status: "pending"
    });
    await dataBooking.save();
    // ==============================
    // 💳 THANH TOÁN VNPAY
    // ==============================
    if (data.namePayment === "vnpay") {
        const url = await paymentHelper.vnpay(dataBooking.id, totalPrice);
        return res.redirect(url);
    }

    // ==============================
    // 💳 THANH TOÁN TIỀN MẶT
    // ==============================
    if (data.namePayment === "cash") {
        const deposit = totalPrice * (30 / 100);
        const url = await paymentHelper.vnpay(dataBooking.id, deposit);
        return res.redirect(url);
    }

    // ==============================
    // 💳 THANH TOÁN MOMO
    // ==============================
    if (data.namePayment === "momo") {
        const url = await paymentHelper.momo(res, dataBooking.id, totalPrice);
        return res.redirect(url);
    }
    res.send("OK");
}

// [GET] /booking/payment-vnpay
module.exports.vnpay = async (req, res) => {
    const isValid = paymentHelper.verifyReturnUrl(req.query);

    if (!isValid) {
        return res.json({
            RspCode: "97",
            Message: "Invalid signature"
        });
    }
    const responseCode = req.query.vnp_ResponseCode;
    const transactionStatus = req.query.vnp_TransactionStatus;
    const booking_id = req.query.vnp_OrderInfo
    if (responseCode === "00" && transactionStatus === "00") {
        const booking = await Booking.findOne({ _id: booking_id });

        // trừ kho
        for (const service of booking.service) {
            await Service.updateOne(
                {
                    _id: service.id,
                    stock: { $gte: 1 }
                },
                {
                    $inc: { stock: -1 }
                }
            );
        }

        // ✅ update trạng thái
        const dataBooking = await Booking.findOneAndUpdate(
            { _id: booking_id },
            { status: "paid" }
        );

        const idPricing = dataBooking.pricing.map(item => item.id);
        return res.redirect(`/booking`);
    } else {
        await Booking.deleteOne(
            { _id: booking_id },
            { status: "failed" }
        );
        return res.redirect("/booking");
    }
}
// [GET] /booking/payment-momo/return
module.exports.return = async (req, res) => {
    if (req.query.resultCode == 0) {
        res.redirect(`/booking/payment/notify?reusultCode=0&&order_id=${order.order_id}`);
    } else {
        res.send("Thanh toán thất bại");
    }
}

// [POST] /booking/payment-momo/notify
module.exports.notify = async (req, res) => {
    const { resultCode, booking_id } = req.params;

    if (resultCode == 0) {
        const booking = await Booking.findOne({ _id: booking_id });

        // trừ kho
        for (const service of booking.service) {
            await Service.updateOne(
                {
                    _id: service.id,
                    stock: { $gte: 1 }
                },
                {
                    $inc: { stock: -1 }
                }
            );
        }

        // ✅ update trạng thái
        await Booking.updateOne(
            { _id: booking_id },
            { status: "paid" }
        );
    } else {
        await Booking.updateOne(
            { _id: booking_id },
            { status: "failed" }
        );
    }

    res.status(200).json({ message: "OK" });
}