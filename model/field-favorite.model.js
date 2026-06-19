const mongoose = require("mongoose");

const fieldFavoriteSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    field_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Field"
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
},
    {
        timestamps: true
    }
);

const Favorite = mongoose.model("Favorite", fieldFavoriteSchema, "field-favorite");
module.exports = Favorite;