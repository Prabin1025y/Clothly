import uploadBufferToCloudinary from "../utils/uploadToCloudinary.js";

export const uploadImageToCloudinary = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided.' });
        }

        // Optional: folder, transformation, resource_type etc
        const options = {
            folder: 'clothly-uploads',
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            resource_type: 'image',
        };

        const result = await uploadBufferToCloudinary(req.file.buffer, options);

        // Return the Cloudinary result (key fields)
        return res.json({
            message: 'Upload successful',
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
        });
    } catch (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Upload failed', details: err.message });
    }
}

export const uploadImageToDisk = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided.' });
        }

        // Construct image URL
        const imageUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;

        // Image metadata
        const imageData = {
            url: imageUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            mimeType: req.file.mimetype,
            uploadedAt: new Date().toISOString()
        };

        console.log('Image uploaded successfully:', {
            filename: req.file.filename,
            size: `${(req.file.size / 1024).toFixed(2)} KB`,
            mimetype: req.file.mimetype
        });

        return res.status(200).json(imageData);
    } catch (err) {
        console.error('Upload error:', err);

        // Clean up file if it was uploaded but processing failed
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            message: process.env.NODE_ENV === 'development' ? err.message : "Internal Server Error!"
        });

    }
}