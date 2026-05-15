const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug)

const fieldSchema = new mongoose.Schema({
    name: String,
    slug: {
        type: String,
        slug: "name",
        unique: true
    },
    size: String,
    grasstype: String,
    timeactive: {
        openTime: String,
        closeTime: String,
        slotDuration: Number
    },
    type: String,
    price: {
        price: Number,
        priceVip: Number
    },
    description: String,
    address: {
        titleAddress: String,
        // quan trọng để mở Google Maps
        lat: Number,
        lng: Number,

        // link sẵn (optional)
        googleMapUrl: String
    },
    service: Array,
    rating: Number,
    category_id: String,
    image: String,
    status: {
        type: String,
        default: 'active'
    },
    position: Number,
    createdBy: {
        account_id: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    deletedBy: {
        account_id: String,
        deletedBy: {
            type: Date
        }
    },
    updatedBy: [
        {
            account_id: String,
            updatedAt: Date
        }
    ],
    deleted: {
        type: Boolean,
        default: false
    }
});
const Field = mongoose.model('Field', fieldSchema, 'field');
module.exports = Field;