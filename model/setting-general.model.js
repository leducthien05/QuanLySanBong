const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    // Website Information
    title: {
        type: String,
        required: true,
        default: 'GreenField'
    },
    logo: {
        type: String,
        default: null
    },
    favicon: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    copyright: {
        type: String,
        default: null
    },

    // Website Configuration
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    maintenanceMessage: {
        type: String,
        default: 'Website is under maintenance. Please come back later.'
    },
    defaultLanguage: {
        type: String,
        default: 'vi'
    },

    // Payment Methods
    paymentMethods: {
        cash: {
            enabled: {
                type: Boolean,
                default: true
            },
            accountName: String,
            description: String
        },
        banking: {
            enabled: {
                type: Boolean,
                default: false
            },
            accountName: String,
            accountNumber: String,
            bankName: String,
            qrImage: String,
            description: String
        },
        momo: {
            enabled: {
                type: Boolean,
                default: false
            },
            accountName: String,
            accountNumber: String,
            qrImage: String,
            description: String
        },
        zalopay: {
            enabled: {
                type: Boolean,
                default: false
            },
            accountName: String,
            accountNumber: String,
            qrImage: String,
            description: String
        },
        vnpay: {
            enabled: {
                type: Boolean,
                default: false
            },
            merchantCode: String,
            accessKey: String,
            secretKey: String,
            description: String
        }
    },

    // Social Media
    socialMedia: {
        facebook: String,
        youtube: String,
        tiktok: String,
        instagram: String,
        zalo: String
    },

    // Audit Fields
    createdBy: {
        account_id: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    updatedBy: [
        {
            account_id: String,
            updatedAt: Date
        }
    ],
    deletedBy: {
        account_id: String,
        deletedAt: {
            type: Date
        }
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

const Setting = mongoose.model('Setting', settingSchema, 'setting-general');
module.exports = Setting;