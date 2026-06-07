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
    avatarUser: Array,
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