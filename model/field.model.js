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
    type: string,
    description: String,
    address: {
        titleAddress: String,
        // quan trọng để mở Google Maps
        lat: Number,
        lng: Number,

        // link sẵn (optional)
        googleMapUrl: String
    },
    rating: Number,
    discountPercentage: Number,
    category_id: String,
    image: array,
    featured: {
        type: String,
        default: "0"
    },
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