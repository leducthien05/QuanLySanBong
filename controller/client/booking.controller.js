const Booking = require("../../model/booking.model");
const Field = require("../../model/field.model");
const Service = require("../../model/service.model");
const Pricing = require("../../model/pricing.model");
const Payment = require("../../model/payment.model");
const Notification = require("../../model/notification.model");
const Refund = require("../../model/refund.model");
const User = require("../../model/user.model");
const Account = require("../../model/account.model");
const Transaction = require("../../model/transaction.model");

const paymentHelper = require("../../helper/payment.helper");
const prcingHelper = require("../../helper/getPricing.helper");
const sendMailHelper = require("../../helper/sendMailer.helper");

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
    console.log("OK")
    // Chuyển data sang Object
    const data = JSON.parse(req.body.bookingData);
    // Lấy danh sách id và update trạng thái của pricing
    const idPricing = data.pricing;
    const dataPricing = await Pricing.find({
        deleted: false,
        _id: { $in: idPricing },
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
    const toMinute = (time) => {
        const [h, m] = time.split(":");

        return (Number(h) * 60 + Number(m));
    };

    // Thời gian hiện tại
    const nowTime = new Date();
    const hour = nowTime.getHours();
    const minute = nowTime.getMinutes();
    const now = `${hour}:${String(minute).padStart(2, "0")}`;

    // Thời gian gửi
    const todayStr =
        nowTime.getFullYear() +
        "-" +
        String(nowTime.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(nowTime.getDate()).padStart(2, "0");

    let pricing = [];

    for (const item of dataPricing) {
        const startMin = toMinute(item.start_time);
        const nowMin = toMinute(now);
        if (data.date === todayStr) {
            if (startMin <= nowMin || startMin - nowMin <= 30) {
                return res.status(400).json({
                    message: "Không thể đặt sân trong vòng 30 phút tới hoặc đã quá giờ đặt sân"
                });
            }
        }

        pricing.push({
            id: item.id,
            time: item.start_time,
            type: item.feature,
            price: item.price
        });
    }

    // Lấy id và danh sách dịch vụ kèm theo
    const idService = data.service.map(item => item.service_id);
    const dataService = await Service.find({
        _id: { $in: idService },
        status: "active",
        deleted: false
    });

    const totalPriceService = dataService.reduce((sum, item) => sum + item.price, 0);

    const service = dataService.map(item => ({
        id: item._id,
        name: item.name,
        price: item.price
    }));
    // Tổng tiền booking 
    const totalPrice = totalPricePricing + totalPriceService;

    const user_id = req.user.id;
    // Khóa booking khi thanh toán
    const existingOrder = await Booking.findOne({
        field_id: data.field_id,
        user_id: user_id,
        date: data.date,
        status: "pending",
        "pricing.id": {
            $in: idPricing
        }
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
        if (!booking) {
            return res.redirect("/booking");
        }
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

        // Update trạng thái booking
        const dataBooking = await Booking.findOneAndUpdate(
            { _id: booking_id },
            { status: "paid" },
            { new: true }
        );
        await Transaction.create({
            booking_id: dataBooking._id,
            user_id: dataBooking.user_id,
            amount: dataBooking.totalPrice,
            payment_method: "vnpay",
            transaction_code: req.query.vnp_TransactionNo,
            status: "success",
            payment_time: new Date()
        });
        // Lấy thông tin người dùng
        const dataUser = await User.findById(dataBooking.user_id)
            .select("userName email");

        // Lấy thông tin sân
        const dataField = await Field.findById(dataBooking.field_id)
            .select("name address");

        // Danh sách khung giờ
        const pricingInfo = dataBooking.pricing.map(item => {
            return `
                <tr>
                    <td>${item.time}</td>
                    <td>${item.price.toLocaleString("vi-VN")} VNĐ</td>
                </tr>
            `;
        }).join("");

        // ================= EMAIL USER =================

        const html = `
            <h2>Đặt sân thành công</h2>

            <p>Xin chào <b>${dataUser.userName}</b>,</p>

            <p>Bạn đã thanh toán thành công đơn đặt sân.</p>

            <ul>
                <li><b>Mã đơn:</b> ${dataBooking._id}</li>
                <li><b>Sân:</b> ${dataField.name}</li>
                <li><b>Ngày đá:</b> ${new Date(dataBooking.date).toLocaleDateString("vi-VN")}</li>
            </ul>

            <table border="1" cellpadding="8" cellspacing="0">
                <tr>
                    <th>Khung giờ</th>
                    <th>Giá</th>
                </tr>
                ${pricingInfo}
            </table>

            <h3>Tổng tiền: ${dataBooking.totalPrice.toLocaleString("vi-VN")} VNĐ</h3>

            <p>Cảm ơn bạn đã sử dụng dịch vụ.</p>
        `;

        sendMailHelper.sendMailer(
            dataUser.email,
            "Xác nhận đặt sân thành công",
            html
        );

        await Notification.create({
            user_id: dataUser._id,
            title: "Đặt sân thành công",
            content: `Bạn đã đặt sân ${dataField.name} thành công cho ngày ${new Date(dataBooking.date).toLocaleDateString("vi-VN")}`,
            side: "client",
            type: "booking",
            read: false
        });

        const admins = await Account.find({
            status: "active",
            deleted: false
        }).select("_id");

        await Notification.insertMany(
            admins.map(admin => ({
                user_id: admin._id,
                title: "Có đơn đặt sân mới",
                content: `${dataUser.userName} vừa thanh toán đơn đặt sân ${dataField.title}`,
                side: "admin",
                type: "booking",
                read: false
            }))
        );
        return res.redirect(`/booking?status=success&booking_id=${booking_id}`);
    } else {
        await Booking.updateOne(
            { _id: booking_id },
            { status: "failed" }
        );

        await Transaction.create({
            booking_id,
            amount: 0,
            payment_method: "vnpay",
            transaction_code: req.query.vnp_TransactionNo,
            status: "failed",
            payment_time: new Date()
        });
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

// [POST] /booking/cancel/:id (AJAX)
module.exports.cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const accountId = req.params.idAccount;
        const userId = req.user.id;

        const booking = await Booking.findOne({ _id: bookingId, deleted: false });
        if (!booking) return res.status(404).json({ message: "Booking không tồn tại." });
        if (String(booking.user_id) !== String(userId)) return res.status(403).json({ message: "Không được phép hủy booking này." });

        // Prevent cancelling already cancelled/completed/failed
        if (booking.status === "canceled" || booking.status === "completed" || booking.status === "failed") {
            return res.status(400).json({ message: "Không thể hủy booking ở trạng thái hiện tại." });
        }

        // Get user's bank info (prefer saved bankInfo, otherwise accept payload)
        const user = await User.findOne({ _id: userId });
        const bankInfo = user.bankInfo

        if (!bankInfo || !bankInfo.accountName || !bankInfo.accountNumber || !bankInfo.bankName) {
            return res.status(400).json({ message: "Thiếu thông tin ngân hàng để hoàn tiền." });
        }

        // Update booking status to canceled (note: existing enum uses 'canceled')
        await Booking.updateOne({ _id: bookingId }, { status: "canceled" });

        // Create Refund document
        const refund = new Refund({
            booking_id: bookingId,
            user_id: userId,
            amount: booking.totalPrice || 0,
            bankName: bankInfo.bankName,
            accountNumber: bankInfo.accountNumber,
            accountName: bankInfo.accountName,
            status: "pending",
            processingBy: accountId,
            createdAt: new Date()
        });
        await refund.save();

        return res.status(200).json({ message: "Hủy lịch thành công. Yêu cầu hoàn tiền đã được tạo." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Có lỗi khi hủy booking." });
    }
}