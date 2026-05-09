const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug)

const categorySchema = new mongoose.Schema({
    name:String,
    slug: {
        type: String,
        slug: "name",
        unique: true
    },
    description:String,
    image:String,
    status: {
        type: String,
        default: 'active'
    },
    position: Number,
    createdBy: {
        account_id: String,
        createdAt: Date
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
const Category =  mongoose.model('Category', categorySchema, 'category');
module.exports = Category;