import multer from "multer";
import fs from "fs";
import path from "path";

//streaming upload for prod
export const bufferUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit (adjust as needed)
    },
    fileFilter: (req, file, cb) => {
        // accept only common image mime types
        if (
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/webp' ||
            file.mimetype === 'image/gif'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed (jpeg, png, webp, gif).'));
        }
    },
});

// disk storage instance for development
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), "uploads");
        try {
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, "-").toLowerCase();
        cb(null, `${Date.now()}-${name}${ext}`);
    },
});

export const diskUpload = multer({
    storage: diskStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/webp' ||
            file.mimetype === 'image/gif'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed (jpeg, png, webp, gif).'));
        }
    },
});
