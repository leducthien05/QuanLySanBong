const mongoose = require("mongoose");

const fieldFavoriteSchema = new mongoose.Schema({
    user_id: String,
    field_id: String,
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
module.exports =  Favorite;