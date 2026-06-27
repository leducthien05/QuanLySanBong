const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
const crypto = require("crypto");

// Thanh toán qua VNPAY
const vnpay = new VNPay({
    tmnCode: process.env.tmnCode,
    secureSecret: process.env.secureSecret,
    vnpayHost: process.env.vnpayHost,
    testMode: true, // tùy chọn
    hashAlgorithm: process.env.hashAlgorithm, // tùy chọn
    loggerFn: ignoreLogger, // tùy chọn
});
module.exports.vnpay = async (booking_id, totalPrice) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const vnpayResponse = await vnpay.buildPaymentUrl({
        vnp_Amount: totalPrice,
        vnp_IpAddr: '127.0.0.1',
        vnp_TxnRef: booking_id,
        vnp_OrderInfo: booking_id,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: `https://quan-ly-san-bong.vercel.app/booking/payment-vnpay`,
        // vnp_IpnUrl: "http://localhost:5080/booking/payment-vnpay-ipn",
        vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
        vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
        vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
    });
    return vnpayResponse;
}
module.exports.verifyReturnUrl = (query) => {
    return vnpay.verifyReturnUrl(query);
};

module.exports.verifyIpn = (params) => {
    return vnpay.verifyIpnCall(query);
};
// Thanh toán qua MOMO
module.exports.momo = async (booking_id, totalPrice) => {
    const partnerCode = "MOMO";
    const accessKey = "F8BBA842ECF85";
    const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const axios = require("axios");
    const requestId = partnerCode + Date.now();
    const orderId = booking_id;
    const orderInfo = "pay with MoMo";

    const redirectUrl = "http://localhost:3000/booking/payment-momo/return";
    const ipnUrl = "http://localhost:3000/booking/payment-momo/notify";

    const amount = totalPrice.toString(); //Tổng tiền
    const requestType = "captureWallet";
    const extraData = "";

    const rawSignature =
        `accessKey=${accessKey}` +
        `&amount=${amount}` +
        `&extraData=${extraData}` +
        `&ipnUrl=${ipnUrl}` +
        `&orderId=${orderId}` +
        `&orderInfo=${orderInfo}` +
        `&partnerCode=${partnerCode}` +
        `&redirectUrl=${redirectUrl}` +
        `&requestId=${requestId}` +
        `&requestType=${requestType}`;

    const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

    const requestBody = {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        extraData,
        requestType,
        signature,
        lang: "vi"
    };

    try {
        console.log("đã gọi 1")
        const response = await axios.post(
            "https://test-payment.momo.vn/v2/gateway/api/create",
            requestBody
        );
        console.log("đã gọi 2")
        // 🔥 Quan trọng nhất
        const payUrl = response.data.payUrl;
        console.log("đã gọi 3");
        console.log(response.data);
        return payUrl;

    } catch (error) {
        console.log(error.response?.data || error);
        throw error;
    }
}
