const mongoose = require("mongoose");

module.exports.connect = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000
        });
        console.log("Connect success");
    } catch (error) {
        console.log(error);
    }
}