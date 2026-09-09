const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const createUpload = (folder, maxSize) => {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder,
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            resource_type: "image"
        }
    });

    return multer({
        storage,
        limits: {
            fileSize: maxSize
        }
    });
};

const userUpload = createUpload(
    "digital-village/users",
    2 * 1024 * 1024
);

const adminUpload = createUpload(
    "digital-village/admins",
    2 * 1024 * 1024
);

const superAdminUpload = createUpload(
    "digital-village/super-admin",
    2 * 1024 * 1024
);

const complaintUpload = createUpload(
    "digital-village/complaints",
    5 * 1024 * 1024
);

const schemeUpload = createUpload(
    "digital-village/schemes",
    5 * 1024 * 1024
);

module.exports = {
    userUpload,
    adminUpload,
    superAdminUpload,
    complaintUpload,
    schemeUpload
};