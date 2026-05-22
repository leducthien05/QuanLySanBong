const Setting = require("../../model/setting-general.model");
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
        const data = {
            title: req.body.title,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            copyright: req.body.copyright,

            // Website Configuration
            maintenanceMessage: req.body.maintenanceMessage,
            defaultLanguage: req.body.defaultLanguage,

            // Payment Methods
            paymentMethods: {
                cash: {
                    enabled: false,
                    accountName: "",
                    description: ""
                },
                banking: {
                    enabled: false,
                    accountName: "",
                    accountNumber: "",
                    bankName: "",
                    qrImage: "",
                    description: ""
                },
                momo: {
                    enabled: false,
                    accountName: "",
                    accountNumber: "",
                    qrImage: "",
                    description: ""
                },
                zalopay: {
                    enabled: false,
                    accountName: "",
                    accountNumber: "",
                    qrImage: "",
                    description: ""
                },
                vnpay: {
                    enabled: false,
                    merchantCode: "",
                    accessKey: "",
                    secretKey: "",
                    description: ""
                }
            },

            // Social Media
            socialMedia: {
                facebook: req.body.facebook,
                youtube: req.body.youtube,
                tiktok: req.body.tiktok,
                instagram: req.body.instagram,
                zalo: req.body.zalo
            },
        }
        if(req.body.logo){
            data.logo = req.body.logo[0];
        }
        if(req.body.favicon){
            data.favicon = req.body.favicon[0];
        }
        // Cash
        if(req.body.cash){
            data.paymentMethods.cash.enabled = true;
            data.paymentMethods.cash.accountName = req.body['accountName'] || "";
            data.paymentMethods.cash.description = req.body['cashDescription'] || "";
        }
        if(req.body.banking){
            data.paymentMethods.banking.enabled = true;
            data.paymentMethods.banking.accountName = req.body['accountName'] || "";
            data.paymentMethods.banking.accountNumber = req.body['accountNumber'] || "";
            data.paymentMethods.banking.bankName = req.body['bankName'] || "";
            data.paymentMethods.banking.description = req.body['description'] || "";
        }
        if(req.body.momo){
            data.paymentMethods.momo.enabled = true;
            data.paymentMethods.momo.accountName = req.body['accountName'] || "";
            data.paymentMethods.momo.accountNumber = req.body['accountNumber'] || "";
            data.paymentMethods.momo.description = req.body['description'] || "";
        }
        if(req.body.zalopay){
            data.paymentMethods.zalopay.enabled = true;
            data.paymentMethods.zalopay.accountName = req.body['accountName'] || "";
            data.paymentMethods.zalopay.accountNumber = req.body['accountNumber'] || "";
            data.paymentMethods.zalopay.description = req.body['description'] || "";
        }
        if(req.body.vnpay){
            data.paymentMethods.vnpay.enabled = true;
            data.paymentMethods.vnpay.merchantCode = req.body['merchantCode'] || "";
            data.paymentMethods.vnpay.accessKey = req.body['accessKey'] || "";
            data.paymentMethods.vnpay.secretKey = req.body['secretKey'] || "";
            data.paymentMethods.vnpay.description = req.body['description'] || "";
        }
        await Setting.updateOne({}, data);
        req.flash("success", "Cập nhật cài đặt thành công");
        res.redirect("/admin/settings");
    } catch (error) {
        console.error("Error updating settings:", error);
        req.flash("error", "Lỗi khi cập nhật cài đặt");
        res.redirect("/admin/settings");
    }
};
