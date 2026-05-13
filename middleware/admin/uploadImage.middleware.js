const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require("streamifier");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

module.exports.uploadCloudinary = async (req, res, next) => {
    if (req.file) {
        let streamUpload = (req) => {
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

                streamifier.createReadStream(req.file.buffer).pipe(stream);

            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            req.body[req.file.fieldname] = result.secure_url;
            next();
        }

        await upload(req);
    } else {
        next();
    }
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

