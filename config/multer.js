import multer from "multer";

const allowedTypes = [
    "text/plain",
    "application/pdf",
    "image/png",
    "image/jpeg",
]

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file type"));
        }
    },
});

export default upload;