const multer =  require("multer");
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "village-complaints",
        allowed_formats: ["jpg", "jpeg", "png"]
    }
});
const upload = multer({
    storage: storage,
    limits: {fileSize: 2 * 1024 * 1024 } //10mb
});
module.exports = upload;