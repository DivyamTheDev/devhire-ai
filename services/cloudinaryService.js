const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const path = require('path');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file buffer to Cloudinary and returns the upload result promise.
 * @param {Buffer} buffer - The file buffer from multer.
 * @param {string} filename - The original filename.
 * @returns {Promise<object>}
 */
const uploadToCloudinary = (buffer, filename) => {
    return new Promise((resolve, reject) => {
        const ext = path.extname(filename);
        const base = path.basename(filename, ext);
        const cleanBase = base.replace(/[^a-zA-Z0-9-_]/g, '_');
        const publicId = `${cleanBase}-${Date.now()}${ext}`;

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'resumes',
                public_id: publicId,
                resource_type: 'raw'
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

module.exports = {
    uploadToCloudinary
};
