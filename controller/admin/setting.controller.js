const Setting = require("../../model/setting-general.model");
const Payment = require("../../model/payment.model");
const upload = require("../../helper/uploadCloudinary.helper");

// [GET] /admin/settings
module.exports.index = async (req, res) => {
    try {
        const setting = await Setting.findOne({
            deleted: false
        });
        const payment = await Payment.find({});
        res.render("admin/page/setting/index", {
            titlePage: "Cài đặt hệ thống",
            setting: setting,
            listPayment: payment
        });
    } catch (error) {
        console.error("Error fetching settings:", error);
        req.flash("error", "Lỗi khi tải cài đặt");
        res.redirect("/admin/dashboard");
    }
};

// [PATCH] /admin/settings/edit
module.exports.editPatch = async (req, res) => {
    try {
        const data = {
            title: req.body.title,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            copyright: req.body.copyright,

            // Website Configuration
            maintenanceMessage: req.body.maintenanceMessage,
            defaultLanguage: req.body.defaultLanguage,

            // Social Media
            socialMedia: {
                facebook: req.body.facebook,
                youtube: req.body.youtube,
                tiktok: req.body.tiktok,
                instagram: req.body.instagram,
                zalo: req.body.zalo
            },
        }
        if (req.body.logo) {
            data.logo = req.body.logo[0];
        }
        if (req.body.favicon) {
            data.favicon = req.body.favicon[0];
        }
        // CASH
        if (req.body.cash) {
            const data = {
                title: "cash",
                accountName: req.body["accountNameCash"] || "",
                description: req.body["descriptionCash"] || "",
                status: "active"
            };

            await Payment.updateOne({
                title: "cash"
            }, data);
        }else{
            await Payment.updateOne({
                title: "cash"
            }, {
                $set: {
                    status: "inactive"
                }
            });
        }

        // BANKING
        if (req.body.banking) {
            const data = {
                title: "banking",
                accountName: req.body["accountNameBanking"] || "",
                accountNumber: req.body["accountNumberBanking"] || "",
                bankingBankName: req.body["bankingBankName"] || "",
                description: req.body["descriptionBanking"] || "",
                status: "active"
            };

            await Payment.updateOne({
                title: "banking"
            }, data);
        }else{
            await Payment.updateOne({
                title: "banking"
            }, {
                $set: {
                    status: "inactive"
                }
            });
        }

        // MOMO
        if (req.body.momo) {
            const data = {
                title: "momo",
                accountName: req.body["accountNameMomo"] || "",
                accountNumber: req.body["accountNumberMomo"] || "",
                description: req.body["descriptionMomo"] || "",
                status: "active"
            };

            await Payment.updateOne({
                title: "momo"
            }, data);
        }else{
            await Payment.updateOne({
                title: "momo"
            }, {
                $set: {
                    status: "inactive"
                }
            });
        }
        // ZALOPAY
        if (req.body.zalopay) {
            const data = {
                title: "zalopay",
                accountName: req.body["accountNameZalopay"] || "",
                accountNumber: req.body["accountNumberPay"] || "",
                description: req.body["descriptionZalopay"] || "",
                status: "active"
            };


            await Payment.updateOne({
                title: "zalopay"
            }, data);
        }else{
            await Payment.updateOne({
                title: "zalopay"
            }, {
                $set: {
                    status: "inactive"
                }
            });
        }

        // VNPAY
        if (req.body.vnpay) {
            const data = {
                title: "vnpay",
                vnpayMerchantCode: req.body["vnpayMerchantCode"] || "",
                vnpayAccessKey: req.body["vnpayAccess"] || "",
                vnpaySecretKey: req.body["vnpaySecret"] || "",
                description: req.body["vnpayDescription"] || "",
                status: "active"
            };

            await Payment.updateOne({
                title: "vnpay"
            }, data);
        }else{
            await Payment.updateOne({
                title: "vnpay"
            }, {
                $set: {
                    status: "inactive"
                }
            });
        }
        await Setting.updateOne({}, data);
        // req.flash("success", "Cập nhật cài đặt thành công");
        res.redirect("/admin/settings");
    } catch (error) {
        console.error("Error updating settings:", error);
        req.flash("error", "Lỗi khi cập nhật cài đặt");
        res.redirect("/admin/settings");
    }
};
