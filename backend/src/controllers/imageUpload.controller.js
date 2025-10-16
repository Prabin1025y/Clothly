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
            return res.status(400).json({ error: 'No image file provided.' });
        }

        console.log(req.file)

        // // Return the Cloudinary result (key fields)
        return res.json({
            message: 'Upload successful',
            url: `${process.env.BACKEND_URL}/${req.file?.filename}`
        });
    } catch (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Upload failed', details: err.message });
    }
}