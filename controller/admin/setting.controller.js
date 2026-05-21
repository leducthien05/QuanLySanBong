const Setting = require("../../model/setting-general.mode");
const upload = require("../../helper/uploadCloudinary.helper");

// [GET] /admin/settings
module.exports.index = async (req, res) => {
    try {
        let setting = await Setting.findOne({
            deleted: false
        });

        // Create default settings if not found
        if (!setting) {
            const defaultSetting = {
                title: 'GreenField',
                status: 'active',
                maintenanceMode: false,
                maintenanceMessage: 'Website is under maintenance. Please come back later.',
                paginationLimit: 10,
                defaultLanguage: 'vi',
                seo: {
                    metaTitle: 'GreenField',
                    metaDescription: 'Sports Field Management System',
                    metaKeywords: 'sports, field, booking'
                },
                paymentMethods: {
                    cash: {
                        enabled: true,
                        accountName: '',
                        description: ''
                    },
                    banking: {
                        enabled: false,
                        accountName: '',
                        accountNumber: '',
                        bankName: '',
                        qrImage: null,
                        description: ''
                    },
                    momo: {
                        enabled: false,
                        accountName: '',
                        accountNumber: '',
                        qrImage: null,
                        description: ''
                    },
                    zalopay: {
                        enabled: false,
                        accountName: '',
                        accountNumber: '',
                        qrImage: null,
                        description: ''
                    },
                    vnpay: {
                        enabled: false,
                        merchantCode: '',
                        accessKey: '',
                        secretKey: '',
                        description: ''
                    }
                },
                socialMedia: {
                    facebook: '',
                    youtube: '',
                    tiktok: '',
                    instagram: '',
                    zalo: ''
                }
            };
            setting = new Setting(defaultSetting);
            await setting.save();
        }

        res.render("admin/page/setting/index", {
            titlePage: "Cài đặt hệ thống",
            setting: setting
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
        const id = req.body.id;
        let setting = await Setting.findOne({
            _id: id,
            deleted: false
        });

        if (!setting) {
            req.flash("error", "Không tìm thấy cài đặt");
            return res.redirect("/admin/settings");
        }

        // Update Website Information
        if (req.body.title) setting.title = req.body.title;
        if (req.body.email) setting.email = req.body.email;
        if (req.body.phone) setting.phone = req.body.phone;
        if (req.body.address) setting.address = req.body.address;
        if (req.body.copyright) setting.copyright = req.body.copyright;

        // Update Website Configuration
        if (req.body.status) setting.status = req.body.status;
        setting.maintenanceMode = req.body.maintenanceMode === 'on' || req.body.maintenanceMode === 'true';
        if (req.body.maintenanceMessage) setting.maintenanceMessage = req.body.maintenanceMessage;
        if (req.body.paginationLimit) setting.paginationLimit = parseInt(req.body.paginationLimit);
        if (req.body.defaultLanguage) setting.defaultLanguage = req.body.defaultLanguage;

        // Update SEO Settings
        if (!setting.seo) setting.seo = {};
        if (req.body.metaTitle) setting.seo.metaTitle = req.body.metaTitle;
        if (req.body.metaDescription) setting.seo.metaDescription = req.body.metaDescription;
        if (req.body.metaKeywords) setting.seo.metaKeywords = req.body.metaKeywords;

        // Update Payment Methods
        if (!setting.paymentMethods) setting.paymentMethods = {};

        // Cash
        if (!setting.paymentMethods.cash) setting.paymentMethods.cash = {};
        setting.paymentMethods.cash.enabled = req.body['payment-cash-enabled'] === 'on';
        if (req.body['payment-cash-name']) setting.paymentMethods.cash.accountName = req.body['payment-cash-name'];
        if (req.body['payment-cash-description']) setting.paymentMethods.cash.description = req.body['payment-cash-description'];

        // Banking
        if (!setting.paymentMethods.banking) setting.paymentMethods.banking = {};
        setting.paymentMethods.banking.enabled = req.body['payment-banking-enabled'] === 'on';
        if (req.body['payment-banking-name']) setting.paymentMethods.banking.accountName = req.body['payment-banking-name'];
        if (req.body['payment-banking-number']) setting.paymentMethods.banking.accountNumber = req.body['payment-banking-number'];
        if (req.body['payment-banking-bankname']) setting.paymentMethods.banking.bankName = req.body['payment-banking-bankname'];
        if (req.body['payment-banking-description']) setting.paymentMethods.banking.description = req.body['payment-banking-description'];

        // MOMO
        if (!setting.paymentMethods.momo) setting.paymentMethods.momo = {};
        setting.paymentMethods.momo.enabled = req.body['payment-momo-enabled'] === 'on';
        if (req.body['payment-momo-name']) setting.paymentMethods.momo.accountName = req.body['payment-momo-name'];
        if (req.body['payment-momo-number']) setting.paymentMethods.momo.accountNumber = req.body['payment-momo-number'];
        if (req.body['payment-momo-description']) setting.paymentMethods.momo.description = req.body['payment-momo-description'];

        // ZaloPay
        if (!setting.paymentMethods.zalopay) setting.paymentMethods.zalopay = {};
        setting.paymentMethods.zalopay.enabled = req.body['payment-zalopay-enabled'] === 'on';
        if (req.body['payment-zalopay-name']) setting.paymentMethods.zalopay.accountName = req.body['payment-zalopay-name'];
        if (req.body['payment-zalopay-number']) setting.paymentMethods.zalopay.accountNumber = req.body['payment-zalopay-number'];
        if (req.body['payment-zalopay-description']) setting.paymentMethods.zalopay.description = req.body['payment-zalopay-description'];

        // VNPay
        if (!setting.paymentMethods.vnpay) setting.paymentMethods.vnpay = {};
        setting.paymentMethods.vnpay.enabled = req.body['payment-vnpay-enabled'] === 'on';
        if (req.body['payment-vnpay-merchant']) setting.paymentMethods.vnpay.merchantCode = req.body['payment-vnpay-merchant'];
        if (req.body['payment-vnpay-access']) setting.paymentMethods.vnpay.accessKey = req.body['payment-vnpay-access'];
        if (req.body['payment-vnpay-secret']) setting.paymentMethods.vnpay.secretKey = req.body['payment-vnpay-secret'];
        if (req.body['payment-vnpay-description']) setting.paymentMethods.vnpay.description = req.body['payment-vnpay-description'];

        // Update Social Media
        if (!setting.socialMedia) setting.socialMedia = {};
        if (req.body.facebook) setting.socialMedia.facebook = req.body.facebook;
        if (req.body.youtube) setting.socialMedia.youtube = req.body.youtube;
        if (req.body.tiktok) setting.socialMedia.tiktok = req.body.tiktok;
        if (req.body.instagram) setting.socialMedia.instagram = req.body.instagram;
        if (req.body.zalo) setting.socialMedia.zalo = req.body.zalo;

        // Handle Logo Upload
        if (req.files && req.files.logo) {
            try {
                const logoResult = await upload(req.files.logo);
                setting.logo = logoResult.url;
            } catch (uploadError) {
                console.error("Logo upload error:", uploadError);
                req.flash("warning", "Lỗi khi tải logo");
            }
        }

        // Handle Favicon Upload
        if (req.files && req.files.favicon) {
            try {
                const faviconResult = await upload(req.files.favicon);
                setting.favicon = faviconResult.url;
            } catch (uploadError) {
                console.error("Favicon upload error:", uploadError);
                req.flash("warning", "Lỗi khi tải favicon");
            }
        }

        // Handle Payment QR Code Uploads
        if (req.files && req.files.bankingQr) {
            try {
                const bankingQrResult = await upload(req.files.bankingQr);
                setting.paymentMethods.banking.qrImage = bankingQrResult.url;
            } catch (uploadError) {
                console.error("Banking QR upload error:", uploadError);
                req.flash("warning", "Lỗi khi tải mã QR ngân hàng");
            }
        }

        if (req.files && req.files.momoQr) {
            try {
                const momoQrResult = await upload(req.files.momoQr);
                setting.paymentMethods.momo.qrImage = momoQrResult.url;
            } catch (uploadError) {
                console.error("MOMO QR upload error:", uploadError);
                req.flash("warning", "Lỗi khi tải mã QR MOMO");
            }
        }

        if (req.files && req.files.zalopayQr) {
            try {
                const zalopayQrResult = await upload(req.files.zalopayQr);
                setting.paymentMethods.zalopay.qrImage = zalopayQrResult.url;
            } catch (uploadError) {
                console.error("ZaloPay QR upload error:", uploadError);
                req.flash("warning", "Lỗi khi tải mã QR ZaloPay");
            }
        }

        // Update audit fields
        if (!setting.updatedBy) {
            setting.updatedBy = [];
        }
        setting.updatedBy.push({
            account_id: req.session.accountId,
            updatedAt: new Date()
        });

        await setting.save();
        req.flash("success", "Cập nhật cài đặt thành công");
        res.redirect("/admin/settings");
    } catch (error) {
        console.error("Error updating settings:", error);
        req.flash("error", "Lỗi khi cập nhật cài đặt");
        res.redirect("/admin/settings");
    }
};
