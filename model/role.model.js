const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: String,
    description: String,
    permission: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        default: 'active'
    },
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
        deletedBy: {
            type: Date
        }
    },
    deleted: {
        type: Boolean,
        default: false
    }
});
const Role =  mongoose.model('Role', roleSchema, 'role');
module.exports = Role;