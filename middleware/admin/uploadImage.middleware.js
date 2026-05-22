const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require("streamifier");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
const streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            {
                folder: "shop/products", // 👈 thêm folder
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};
const uploadCloudinary = async (buffer) => {
    let result = await streamUpload(buffer);
    return result["url"];
}
module.exports.uploadSingle = async (req, res, next) => {
    if (req.file) {
        async function upload(req) {
            let result = await uploadCloudinary(req.file.buffer);
            req.body[req.file.fieldname] = result.secure_url;
            next();
        }

        await upload(req);
    } else {
        next();
    }
}
module.exports.uploadMulti = async (req, res, next) => {
    /* {
        avatar: [
            {
                fieldname: "avatar",
                buffer: <....>
            }
        ],
        audio: [
            {
                fieldname: "audio",
                buffer: <....>
            }
        ]
    }*/
    for(const key in req["files"]){
        req.body[key] = [];
        const array = req["files"][key];// array = giá trị của key(value)
        for(const item of array){
            try {
                const result = await uploadCloudinary(item.buffer);
                req.body[key].push(result);
            } catch (error) {
                console.log(error);
            }
        }
    }
    next();
}

module.exports.uploadStorage = () => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "public/admin/uploads/");
        },
        filename: function (req, file, cb) {
            const unique = Date.now() + "-" + file.originalname;
            cb(null, unique);
        }
    });

    return multer({ storage: storage });
};

