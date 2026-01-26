import { pool, sql } from "../../config/db.js";
import logger from "../../config/logger.js";
import { adminAddProductSchema, adminEditProductSchema } from "../../validation/product.schema.js";

/**
 * Get all products (paginated) - grouped by main product
 * GET /api/admin/products?page=1&limit=10
 */
export const getAdminProducts = async (req, res) => {
    try {
        const MAX_LIMIT = 50;
        const DEFAULT_LIMIT = 20;

        const limit = Number.parseInt(req.query.limit ?? String(DEFAULT_LIMIT), 10);
        const page = Number.parseInt(req.query.page ?? "1", 10);
        const search_query = (req.query.search ?? "").toString().trim().replace(/\s+/g, ' ')
        const min = Number.parseInt(req.query.min ?? "0", 10)
        const max = req.query.max ? Number.parseInt(req.query.max, 10) : "";
        const sortBy = req.query.sortby || 'name'
        const sortOrder = String(req.query.order) || 'desc'
        const status = req.query.status || 'all'

        if (!Number.isFinite(page) || page < 1)
            return res.status(400).json({ success: false, message: "Invalid page parameter!!" });
        if (!Number.isFinite(limit) || limit < 1 || limit > MAX_LIMIT)
            return res.status(400).json({ success: false, message: `Invalid limit parameter (1-${MAX_LIMIT})` });

        const offset = (page - 1) * limit;

        // Get total count
        const totalProducts = await sql`
            SELECT COUNT(*)::int AS total
            FROM products p
            WHERE ${status === "all" ? sql`p.status IN ('active', 'archived', 'draft')` : sql`p.status = ${status}`} AND p.deleted_at IS NULL
                ${search_query ? sql`
                    AND (
                        to_tsvector('english', coalesce(p.name,'') || ' ' || coalesce(p.short_description,'')) 
                        @@ plainto_tsquery('english', ${search_query})
                        OR p.name ILIKE ${'%' + search_query + '%'}
                        OR p.short_description ILIKE ${'%' + search_query + '%'}
                    )
                ` : sql``}
                ${min > 0 ? sql` AND p.current_price >= ${min}` : sql``}
                ${max !== "" ? sql`AND p.current_price <= ${max}` : sql``}
        `;

        if (totalProducts.length === 0)
            return res.status(200).json({
                data: [],
                meta: {
                    totalProducts: 0,
                    totalPages: 1,
                    page: 1,
                    limit
                }
            })

        const total = totalProducts?.[0]?.total ?? 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        // Get products with main image
        const products = await sql`
            SELECT
                p.id,
                p.public_id,
                p.sku,
                p.name,
                p.slug,
                p.short_description,
                p.status,
                p.original_price,
                p.current_price,
                p.sold_count,
                p.review_count,
                p.average_rating,
                p.is_featured,
                p.created_at,
                p.updated_at,
                pi.url AS image_url,
                pi.alt_text AS image_alt_text
            FROM products p
            LEFT JOIN product_images pi ON p.main_image_id = pi.id
            WHERE ${status === "all" ? sql`p.status IN ('active', 'archived', 'draft')` : sql`p.status = ${status}`} AND p.deleted_at IS NULL
            ${search_query ? sql`
                AND (
                to_tsvector('english', coalesce(p.name,'') || ' ' || coalesce(p.short_description,'')) 
                @@ plainto_tsquery('english', ${search_query})
                OR p.name ILIKE ${'%' + search_query + '%'}
                OR p.short_description ILIKE ${'%' + search_query + '%'}
                )
            ` : sql``}
            ${min > 0 ? sql` AND p.current_price >= ${min}` : sql``}
            ${max !== "" ? sql`AND p.current_price <= ${max}` : sql``}
            ORDER BY 
                ${sortBy === 'price' ? sql`p.current_price` :
                sortBy === 'sold' ? sql`p.sold_count` :
                    sortBy === 'rating' ? sql`p.average_rating` :
                        sortBy === 'date' ? sql`p.created_at` :
                            sql`p.name`}
                ${sortOrder.toUpperCase() === 'ASC' ? sql`ASC` : sql`DESC`}
            LIMIT ${limit} OFFSET ${offset}
        `;

        return res.status(200).json({
            data: products,
            meta: {
                totalProducts: total,
                totalPages: totalPages,
                page,
                limit
            }
        });
    } catch (error) {
        logger.error("Error while getting admin products!!", error);
        return res.status(500).json({ message: "Failed to fetch products" });
    }
};

/**
 * Get color variants for a specific product
 * GET /api/admin/products/:productId/colors
 */
export const getProductColors = async (req, res) => {
    try {
        const productId = parseInt(req.params.productId, 10);

        if (!productId || isNaN(productId))
            return res.status(400).json({ success: false, message: "Valid product ID is required" });

        // Get distinct colors for the product
        const colors = await sql`
            SELECT DISTINCT
                pv.color,
                pv.hex_color,
                COUNT(DISTINCT pv.size) AS size_count,
                SUM(pv.available) AS total_available
            FROM product_variants pv
            WHERE pv.product_id = ${productId}
                AND pv.deleted_at IS NULL
            GROUP BY pv.color, pv.hex_color
            ORDER BY pv.color ASC
        `;

        return res.status(200).json({
            success: true,
            data: colors
        });
    } catch (error) {
        logger.error("Error while getting product colors!!", error);
        return res.status(500).json({ success: false, message: "Failed to fetch product colors" });
    }
};

/**
 * Get sizes for a specific product and color combination
 * GET /api/admin/products/:productId/colors/:color/sizes
 */
export const getProductSizes = async (req, res) => {
    try {
        const productId = parseInt(req.params.productId, 10);
        const color = decodeURIComponent(req.params.color);

        if (!productId || isNaN(productId) || !color)
            return res.status(400).json({ success: false, message: "Valid product ID and color are required" });

        // Get all sizes for the product and color combination
        const sizes = await sql`
            SELECT
                pv.id AS variant_id,
                pv.sku,
                pv.size,
                pv.original_price,
                pv.current_price,
                pv.available,
                pv.reserved,
                pv.on_hold,
                pv.barcode,
                pv.created_at,
                pv.updated_at
            FROM product_variants pv
            WHERE pv.product_id = ${productId}
                AND pv.color = ${color}
                AND pv.deleted_at IS NULL
            ORDER BY 
                CASE pv.size
                    WHEN 'XS' THEN 1
                    WHEN 'S' THEN 2
                    WHEN 'M' THEN 3
                    WHEN 'L' THEN 4
                    WHEN 'XL' THEN 5
                    WHEN 'XXL' THEN 6
                    WHEN 'XXXL' THEN 7
                    ELSE 99
                END,
                pv.size ASC
        `;

        return res.status(200).json({
            success: true,
            data: sizes
        });
    } catch (error) {
        logger.error("Error while getting product sizes!!", error);
        return res.status(500).json({ success: false, message: "Failed to fetch product sizes" });
    }
};

export const addProductV2 = async (req, res) => {
    const client = await pool.connect();

    try {
        const body = req.body
        const productDetailsFromBody = JSON.parse(body.details)
        const colorVariantsFromBody = JSON.parse(body.colorVariants);

        const imageMetadataFromBody = JSON.parse(body.imageMetadata)

        console.log(req.files)

        const toBeParsed = {
            productName: body.productName,
            sku: body.sku,
            slug: body.slug,
            status: body.status,
            warranty: body.warranty,
            originalPrice: body.originalPrice,
            discountedPrice: body.discountedPrice,
            description: body.description,
            shortDescription: body.shortDescription,
            imageMetadata: imageMetadataFromBody,
            images: req.files,
            details: productDetailsFromBody,
            colorVariants: colorVariantsFromBody
        }

        const parsed = adminAddProductSchema.parse(toBeParsed)

        const {
            productName,
            sku,
            slug,
            status,
            warranty,
            originalPrice,
            discountedPrice,
            isFeatured,
            isReturnable,
            currency,
            description,
            shortDescription,
            imageMetadata,
            images,
            details,
            colorVariants
        } = parsed;

        const userId = req.userId || 1 //TODO: Remove 1 in production

        if (!userId)
            return res.status(403).json({ message: "Please log in first!" });

        await client.query("BEGIN");

        //Insert product
        const insertProductResponse = await client.query(`
                INSERT INTO products (
                    name,
                    sku,
                    slug,
                    short_description,
                    description,
                    status,
                    original_price,
                    current_price,
                    currency,
                    is_featured,
                    is_returnable,
                    warranty_info,
                    created_by
                ) VALUES (
                 $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13 
                ) RETURNING id
            `, [
            productName,
            sku,
            slug,
            shortDescription,
            description,
            status,
            originalPrice,
            discountedPrice,
            currency,
            isFeatured,
            isReturnable,
            warranty,
            userId
        ])

        if (insertProductResponse.rowCount === 0)
            throw new Error("Product cannot be inserted!")

        //Extract product id
        const productId = insertProductResponse.rows[0].id

        //Insert image
        const imagePlaceholder = images.map((_, idx) => (
            `($${idx * 4 + 1}, $${idx * 4 + 2}, $${idx * 4 + 3}, $${idx * 4 + 4})`
        )).join(", ");


        const imageValues = images.flatMap((image, index) => [
            productId,
            `${process.env.BACKEND_URL}/uploads/${image.filename}`,
            imageMetadata[index].altText || `image ${index + 1} of product`,
            imageMetadata[index].isPrimary
        ])

        const insertImageResponse = await client.query(`
                INSERT INTO product_images (
                    product_id,
                    url,
                    alt_text,
                    is_primary
                ) VALUES ${imagePlaceholder}
                 RETURNING id, is_primary
            `, imageValues)

        if (insertImageResponse.rowCount === 0)
            throw new Error("Product image cannot be inserted!")


        const primaryImageId = insertImageResponse.rows.find(row => row.is_primary === true).id
        if (!primaryImageId)
            throw new Error("No primary image found for inserted product")

        await client.query(`
            UPDATE products 
            SET main_image_id = $1
            WHERE id = $2;
            `, [primaryImageId, productId])

        // Insert product variants
        const combination = []
        colorVariants.forEach(variant => {
            variant.sizes.forEach(size => {
                combination.push({
                    colorName: variant.colorName,
                    colorHex: variant.colorHex,
                    size: size.size,
                    quantity: size.quantity
                })
            })
        })

        const variantPlaceholder = combination.map((_, idx) => (
            `($${idx * 8 + 1}, $${idx * 8 + 2}, $${idx * 8 + 3}, $${idx * 8 + 4}, $${idx * 8 + 5}, $${idx * 8 + 6}, $${idx * 8 + 7}, $${idx * 8 + 8})`
        )).join(", ")

        const variantValues = combination.flatMap(comb => [
            productId,
            `${sku}-${comb.colorName.substring(0, 3).toUpperCase()}-${comb.size}`,
            comb.colorName,
            comb.colorHex,
            comb.size,
            originalPrice,
            discountedPrice,
            comb.quantity
        ])

        console.log(variantValues)
        console.log(variantPlaceholder)

        const insertVariantResponse = await client.query(`
                INSERT INTO product_variants (
                    product_id,
                    sku,
                    color,
                    hex_color,
                    size,
                    original_price,
                    current_price,
                    available
                ) VALUES ${variantPlaceholder}
            `, variantValues)

        if (insertVariantResponse.rowCount === 0)
            throw new Error("Product variant cannot be inserted!")

        console.log("variants inserted")

        //Insert product details
        const detailPlaceholder = details.map((_, idx) => (
            `($${idx * 2 + 1}, $${idx * 2 + 2})`
        )).join(", ")

        const detailValues = details.flatMap(detail => [productId, detail.text])

        const insertDetailResponse = await client.query(`
                INSERT INTO product_details (
                    product_id,
                    text
                ) VALUES ${detailPlaceholder}
            `, detailValues)

        console.log("details inserted")

        if (insertDetailResponse.rowCount === 0)
            throw new Error("Product detail cannot be inserted!")

        client.query("COMMIT");
        res.status(201).json({ id: productId })

    } catch (error) {
        client.query("ROLLBACK");
        logger.error("Error while adding product!!", error);

        if (error.name === "ZodError") {
            // Send validation errors
            return res.status(400).json({
                message: "Validation failed! Please check your inputs.",
            });
        }

        return res.status(500).json({ success: false, message: "Error adding product" });
    } finally {
        client.release();
    }
}

export const getProductDetail = async (req, res) => {
    try {
        const slug = req.params.slug
        if (!slug)
            res.status(404).json({ success: false, message: "No such product found!!" })

        const result = await sql`
            SELECT
                p.sku AS product_sku,
                p.public_id,
                p.id,
                p.name,
                p.slug,
                p.description,
                p.short_description,
                p.status,
                p.warranty_info, 
                p.original_price,
                p.current_price,
                -- p.sold_count,
                -- p.review_count,
                -- p.average_rating,
                -- p.is_featured,
                -- p.is_returnable,
                -- p.warranty_info,
                COALESCE(img.images, '[]')     AS images,
                COALESCE(vars.variants, '[]')  AS variants,
                COALESCE(dets.details, '[]')   AS details
            FROM products p
            LEFT JOIN LATERAL (
                SELECT json_agg(json_build_object('url', url, 'alt_text', alt_text, 'is_primary', is_primary)) AS images
                FROM product_images pi
                WHERE pi.product_id = p.id
                ) img ON true
            LEFT JOIN LATERAL (
                SELECT json_agg(json_build_object(
                    'sku', sku,
                    'color', color,
                    'hex_color', hex_color,
                    'size', size,
                    'variant_id', id,
                    'available', available
                    ) ) AS variants
                FROM product_variants pv
                WHERE pv.product_id = p.id AND pv.available > 0
                ) vars ON true
            LEFT JOIN LATERAL (
                SELECT json_agg(json_build_object('text', text)) AS details
                FROM product_details pd
                WHERE pd.product_id = p.id
                ) dets ON true
            WHERE p.slug = ${slug} AND p.status = 'active';
        `

        if (result.length === 0)
            return res.status(404).json({ message: "No such product found." });

        const data = result?.[0]

        // data['primary_image'] = data.images?.find(image => image.is_primary)
        console.log(data);

        res.status(200).json(data);
    } catch (error) {
        logger.error("Error while getting specific product!!", error);
        return res.status(500).json({ message: "Error getting product" });
    }
}

export const updateProduct = async (req, res) => {
    const client = await pool.connect();

    try {
        const { slug: productSlug } = req.params;
        const body = req.body;
        const productDetailsFromBody = JSON.parse(body.details);
        const colorVariantsFromBody = JSON.parse(body.colorVariants);
        const existingImageFromBody = JSON.parse(body.existingImage)
        const imageMetadataFromBody = body.imageMetadata ? JSON.parse(body.imageMetadata) : null;

        console.log(req.files);
        console.log(req.body);
        const toBeParsed = {
            productName: body.productName,
            sku: body.sku,
            slug: body.slug,
            status: body.status,
            warranty: body.warranty,
            originalPrice: body.originalPrice,
            discountedPrice: body.discountedPrice,
            description: body.description,
            shortDescription: body.shortDescription,
            imageMetadata: imageMetadataFromBody,
            existingImage: existingImageFromBody,
            images: req.files || [],
            details: productDetailsFromBody,
            colorVariants: colorVariantsFromBody
        };

        const parsed = adminEditProductSchema.parse(toBeParsed);

        const {
            productName,
            sku,
            slug,
            status,
            warranty,
            originalPrice,
            discountedPrice,
            isFeatured,
            isReturnable,
            currency,
            description,
            shortDescription,
            imageMetadata,
            existingImage,
            images,
            details,
            colorVariants
        } = parsed;

        const userId = req.userId || 1; //TODO: Remove 1 in production

        if (!userId)
            return res.status(403).json({ message: "Please log in first!" });

        await client.query("BEGIN");

        // Check if product exists
        const productCheck = await client.query(
            `SELECT id FROM products WHERE slug = $1`,
            [productSlug]
        );

        if (productCheck.rowCount === 0) {
            throw new Error("Product not found!");
        }

        const productId = productCheck.rows[0].id

        // Update product basic info
        const updateProductResponse = await client.query(`
                UPDATE products SET
                    name = $1,
                    sku = $2,
                    slug = $3,
                    short_description = $4,
                    description = $5,
                    status = $6,
                    original_price = $7,
                    current_price = $8,
                    currency = $9,
                    is_featured = $10,
                    is_returnable = $11,
                    warranty_info = $12,
                    updated_at = NOW()
                WHERE id = $13
                RETURNING id
            `, [
            productName,
            sku,
            slug,
            shortDescription,
            description,
            status,
            originalPrice,
            discountedPrice,
            currency,
            isFeatured,
            isReturnable,
            warranty,
            productId
        ]);

        if (updateProductResponse.rowCount === 0)
            throw new Error("Product cannot be updated!");

        // Handle images only if new ones are uploaded
        if ((images.length + existingImage.length) > 0 && imageMetadata) {
            // Delete old images
            await client.query(`
                DELETE FROM product_images WHERE product_id = $1
            `, [productId]);

            const allImages = []
            if (images && Array.isArray(images) && images.length > 0) {
                images.forEach(image => {
                    allImages.push(`${process.env.BACKEND_URL}/uploads/${image.filename}`)
                })
            }

            if (existingImage && existingImage.length > 0) {
                existingImage.forEach(image => {
                    allImages.push(image.url)
                })
            }

            // Insert new images
            const imagePlaceholder = allImages.map((_, idx) => (
                `($${idx * 4 + 1}, $${idx * 4 + 2}, $${idx * 4 + 3}, $${idx * 4 + 4})`
            )).join(", ");

            const imageValues = allImages.flatMap((image, index) => [
                productId,
                image,
                imageMetadata[index].altText || `image ${index + 1} of product`,
                imageMetadata[index].isPrimary
            ]);

            const insertImageResponse = await client.query(`
                INSERT INTO product_images (
                    product_id,
                    url,
                    alt_text,
                    is_primary
                ) VALUES ${imagePlaceholder}
                RETURNING id, is_primary
            `, imageValues);

            if (insertImageResponse.rowCount === 0)
                throw new Error("Product images cannot be inserted!");

            const primaryImageId = insertImageResponse.rows.find(row => row.is_primary === true)?.id;
            if (primaryImageId) {
                await client.query(`
                    UPDATE products 
                    SET main_image_id = $1
                    WHERE id = $2
                `, [primaryImageId, productId]);
            }
        }

        // Smart variant update - only modify what changed
        const combination = [];
        colorVariants.forEach(variant => {
            variant.sizes.forEach(size => {
                combination.push({
                    colorName: variant.colorName,
                    colorHex: variant.colorHex,
                    size: size.size,
                    quantity: size.quantity
                });
            });
        });

        // Get existing variants
        const existingVariants = await client.query(`
            SELECT id, sku, color, hex_color, size, available
            FROM product_variants
            WHERE product_id = $1
        `, [productId]);

        const existingVariantsMap = new Map(
            existingVariants.rows.map(v => [
                `${v.color}-${v.size}`,
                v
            ])
        );

        const newVariantsMap = new Map(
            combination.map(v => [
                `${v.colorName}-${v.size}`,
                v
            ])
        );

        // Find variants to delete (exist in DB but not in new data)
        const variantsToDelete = [];
        existingVariantsMap.forEach((variant, key) => {
            if (!newVariantsMap.has(key)) {
                variantsToDelete.push(variant.id);
            }
        });

        if (variantsToDelete.length > 0) {
            await client.query(`
                DELETE FROM product_variants 
                WHERE id = ANY($1)
            `, [variantsToDelete]);
        }

        // Update or insert variants
        for (const comb of combination) {
            const key = `${comb.colorName}-${comb.size}`;
            const existing = existingVariantsMap.get(key);
            const variantSku = `${sku}-${comb.colorName.substring(0, 3).toUpperCase()}-${comb.size}`;

            if (existing) {
                // Update existing variant if data changed
                if (existing.available !== comb.quantity ||
                    existing.hex_color !== comb.colorHex ||
                    existing.sku !== variantSku) {
                    await client.query(`
                        UPDATE product_variants SET
                            sku = $1,
                            hex_color = $2,
                            original_price = $3,
                            current_price = $4,
                            available = $5
                        WHERE id = $6
                    `, [
                        variantSku,
                        comb.colorHex,
                        originalPrice,
                        discountedPrice,
                        comb.quantity,
                        existing.id
                    ]);
                }
            } else {
                // Insert new variant
                await client.query(`
                    INSERT INTO product_variants (
                        product_id,
                        sku,
                        color,
                        hex_color,
                        size,
                        original_price,
                        current_price,
                        available
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                    productId,
                    variantSku,
                    comb.colorName,
                    comb.colorHex,
                    comb.size,
                    originalPrice,
                    discountedPrice,
                    comb.quantity
                ]);
            }
        }

        console.log("variants updated intelligently");

        // Smart details update
        const existingDetails = await client.query(`
            SELECT id, text
            FROM product_details
            WHERE product_id = $1
            ORDER BY id
        `, [productId]);

        const existingTexts = new Set(existingDetails.rows.map(d => d.text));
        const newTexts = new Set(details.map(d => d.text));

        // Find details to delete
        const detailsToDelete = existingDetails.rows
            .filter(d => !newTexts.has(d.text))
            .map(d => d.id);

        if (detailsToDelete.length > 0) {
            await client.query(`
                DELETE FROM product_details 
                WHERE id = ANY($1)
            `, [detailsToDelete]);
        }

        // Find details to insert
        const detailsToInsert = details.filter(d => !existingTexts.has(d.text));

        if (detailsToInsert.length > 0) {
            const detailPlaceholder = detailsToInsert.map((_, idx) => (
                `($${idx * 2 + 1}, $${idx * 2 + 2})`
            )).join(", ");

            const detailValues = detailsToInsert.flatMap(detail => [productId, detail.text]);

            await client.query(`
                INSERT INTO product_details (
                    product_id,
                    text
                ) VALUES ${detailPlaceholder}
            `, detailValues);
        }

        console.log("details updated intelligently");

        await client.query("COMMIT");
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            id: productId
        });

    } catch (error) {
        await client.query("ROLLBACK");
        logger.error("Error while updating product!!", error);

        if (error.name === "ZodError") {
            return res.status(400).json({
                message: "Validation failed! Please check your inputs.",
            });
        }

        if (error.message === "Product not found!") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error updating product"
        });
    } finally {
        client.release();
    }
};
