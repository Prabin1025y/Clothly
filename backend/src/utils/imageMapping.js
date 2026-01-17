export function mapImageWithMetadata(images, metadata) {
    return images.map((image, index) => ({
        url: `${process.env.BACKEND_URL}/uploads/${image.filename}`,
        alText: metadata[index].altText,
        isPrimary: metadata
    }))
}