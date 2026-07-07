const multer = require('multer');
const path = require('path');
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Resumes only! (PDF, DOC, DOCX)'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: fileFilter
});

module.exports = upload;