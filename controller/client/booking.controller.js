const Booking = require("../../model/booking.model");
const Field = require("../../model/field.model");
const Service = require("../../model/service.model");
const Pricing = require("../../model/pricing.model");
const Payment = require("../../model/payment.model");

const paymentHelper = require("../../helper/payment.helper");
const prcingHelper = require("../../helper/getPricing.helper");

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
    let successData = null;
    if (req.query.status === "success" && req.query.booking_id) {
        const booking = await Booking.findOne({ _id: req.query.booking_id });
        if (booking) {
            const field = await Field.findOne({ _id: booking.field_id });
            const times = booking.pricing
                .map(slot => slot.time)
                .filter(Boolean)
                .sort((a, b) => {
                    const [ah, am] = a.split(":").map(Number);
                    const [bh, bm] = b.split(":").map(Number);
                    return ah * 60 + am - (bh * 60 + bm);
                });
            const timeRange = times.length > 1 ? `${times[0]} - ${times[times.length - 1]}` : times[0] || "";
            successData = {
                fieldName: field?.name || "N/A",
                location: field?.address?.titleAddress || "N/A",
                date: booking.date ? booking.date.toISOString().split("T")[0] : "N/A",
                timeRange: timeRange || "N/A",
                totalPrice: booking.totalPrice ? booking.totalPrice.toLocaleString("vi-VN") + " đ" : "N/A"
            };
        }
    }

    res.render("client/page/booking/index", {
        pageTitle: "Đặt Sân Bóng - Quản Lý Sân Bóng",
        fields: fields,
        services: services,
        pricings: pricings,
        address: uniqueAddresses,
        payment: payment,
        successData: successData
    });
}

// [GET] /booking/filter
module.exports.filter = async (req, res) => {
    const find = {
        deleted: false,
        status: "active"
    };

    // Tìm kiếm theo loại sân
    if (req.query.type) {
        find.type = req.query.type;
    }

    // Tìm kiếm theo địa chỉ
    if (req.query.address) {
        find["address.titleAddress"] = new RegExp(req.query.address, "i");
    }

    const keyword = req.query.keyword || "";

    if (req.query.keyword) {
        if (!keyword.trim()) return res.status(200).json([]);
        const fields = await Field.find({
            deleted: false,
            status: "active",
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { "address.titleAddress": { $regex: keyword, $options: "i" } }
            ]
        }).select("name image address slug").limit(8).lean();
        const results = fields.map(f => ({
            _id: f._id,
            title: f.name,
            address: f.address?.titleAddress || "Không rõ",
            thumbnail: f.image || "/default-field.jpg",
            slug: f.slug || f._id
        }));
        res.status(200).json(results);

    }

    const fields = await Field.find(find);

    res.status(200).json({
        fields: fields
    });
}

// [GET] /booking/field/:id
module.exports.getField = async (req, res) => {
    const date = req.query.date;
    const field_id = req.params.id;
    const pricing = await prcingHelper.getPricing(date, field_id);
    res.status(200).json({
        pricings: pricing.pricing,
        date: pricing.date
    });
}

// [POST] /booking/payment
module.exports.payment = async (req, res) => {
    // Chuyển data sang Object
    const data = JSON.parse(req.body.bookingData);
    // Lấy danh sách id và update trạng thái của pricing
    console.log(data)
    const idPricing = data.pricing;
    const dataPricing = await Pricing.find({
        deleted: false,
        _id: { $in: idPricing },
    });

    console.log(dataPricing)
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
    const toMinute = (time) => {
        const [h, m] = time.split(":");

        return (Number(h) * 60 + Number(m));
    };
    const nowTime = new Date();
    const hour = nowTime.getHours();
    const minute = nowTime.getMinutes();
    let pricing = [];
    dataPricing.forEach(item => {
        const now = `${hour}:${minute}`;
        if (toMinute(item.start_time) > toMinute(now) && toMinute(item.start_time) - toMinute(now) > 30) {
            const record = {
                id: item.id,
                time: item.start_time,
                type: item.feature,
                price: item.price
            }
            pricing.push(record);
        } else {
            return res.status(400).json({
                message: "Không thể đặt sân trong vòng 30 phút tới vì có đã quá giờ đặt sân"
            });
        }

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

    const user_id = req.user.id;
    // Khóa booking khi thanh toán
    const existingOrder = await Booking.findOne({
        field_id: data.field_id,
        user_id: user_id,
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
        if (data.namePayment === "vnpay") {
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
            const url = await paymentHelper.momo(existingOrder.id, existingOrder.totalPrice);
            return res.redirect(url);
        }
    }

    // Tạo booking
    const maxPricing = dataPricing.reduce((max, item) => {
        return toMinute(item.start_time) > toMinute(max.start_time) ? item : max;
    });
    const expired_at = new Date(`${data.date}T${maxPricing.start_time}:00`);

    const dataBooking = new Booking({
        field_id: data.field_id,
        user_id: user_id,
        pricing: pricing,
        date: data.date,
        totalPrice: totalPrice,
        node: data.node,
        paymentMethod: data.payment,
        service: service,
        status: "pending",
        expireAt: expired_at
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
        const url = await paymentHelper.momo(dataBooking.id, totalPrice);

        return res.redirect(url);
    }

    return res.send("OK");
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
        return res.redirect(`/booking?status=success&booking_id=${booking_id}`);
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
    const booking_id = req.query.orderId;
    if (req.query.resultCode == 0) {
        res.redirect(`/booking?status=success&booking_id=${booking_id}`);
    } else {
        await Booking.updateOne({
            _id: booking_id
        }, {
            status: "failed"
        });
        res.redirect("/booking");
    }
}

// [GET] /booking/payment-momo/notify
module.exports.notify = async (req, res) => {
    const { resultCode, booking_id } = req.query;
    console.log("Đã gọi notify");
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