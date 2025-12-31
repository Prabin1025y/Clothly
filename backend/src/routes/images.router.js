import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { uploadImageToDisk } from "../controllers/imageUpload.controller.js";
import { diskUpload } from "../config/multer.js";
import multer from "multer";

const imagesRouter = Router()

imagesRouter.post("/disk-upload", (req, res, next) => { //TODO: add isauthenticated
    diskUpload.single("image")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File size exceeds 5MB limit'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    error: 'Too many files. Only 1 file allowed'
                });
            }
            return res.status(400).json({
                success: false,
                error: err.message
            });
        } else if (err) {
            // Custom errors (like file type validation)
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }
        // No error, proceed to controller
        next();
    });
}, uploadImageToDisk);

export default imagesRouter