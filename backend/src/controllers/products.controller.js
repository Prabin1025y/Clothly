import { pool, sql } from "../config/db.js";
import logger from "../config/logger.js";
import { adminProductSchema, productSchema } from "../validation/product.schema.js";

export const addProduct = async (req, res) => {
    //Parse body using zod
    const parsed = productSchema.parse(req.body)

    const {
        sku,
        name,
        slug,
        short_description = "",
        description = "",
        status = "draft",
        original_price,
        current_price,
        currency = "NPR",
        is_featured = false,
        is_returnable = true,
        warranty_info = "",
        images,
        variants,
        details,
        created_by = 1
    } = parsed

    const client = await pool.connect()

    try {

        await client.query(`BEGIN`);

        //Insert products to database
        const inserted_product = await client.query(`
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
            ) RETURNING id, public_id, name, sku, slug, current_price;
        `, [
            name,
            sku,
            slug,
            short_description,
            description,
            status,
            original_price,
            current_price ? current_price : original_price,
            currency,
            is_featured,
            is_returnable,
            warranty_info,
            created_by
        ])

        // const inserted_product = await client.query(sql`
        //     INSERT INTO products (
        //         name, sku, slug, short_description, description, status,
        //         original_price, current_price, currency, is_featured,
        //         is_returnable, warranty_info, created_by
        //     ) VALUES (
        //         ${name}, ${sku}, ${slug}, ${short_description},
        //         ${description}, ${status}, ${original_price}, ${current_price},
        //         ${currency}, ${is_featured}, ${is_returnable}, ${warranty_info},
        //         ${created_by}
        //     ) RETURNING id, public_id, name, sku, slug, current_price;
        // `);

        //Extract product_id from inserted product
        const product = inserted_product.rows[0]
        if (!product) throw new Error("Failed to insert product");
        const product_id = product.id

        //Prepare placeholder for inserting multiple images
        //return placeholderl like (1, $1, $2, $3),(1, $4, $5, $6)
        const image_placeholder = images.map((_, i) => (
            `(${product_id}, $${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`
        )).join(", ");

        //Values to fit into above placeholder
        const image_values = images.flatMap(image => [
            image.url,
            image.alt_text,
            image.is_primary
        ]);

        //query the database to insert multiple rows
        const inserted_images = await client.query(`
            INSERT INTO product_images (product_id, url,alt_text, is_primary)
            VALUES ${image_placeholder}
            RETURNING id, url, alt_text, is_primary;`, image_values);

        //update primary_image_id field of products now that images has been inserted
        const primary_image_id = inserted_images.rows.find(row => row.is_primary === true).id
        if (primary_image_id)
            await client.query(`
            UPDATE products 
            SET main_image_id = $1
            WHERE id = $2;
            `, [primary_image_id, product_id])

        //Same as image above
        const no_of_fields_in_variants = 7
        const variant_placeholder = variants.map((_, i) => (
            `(${product_id},
            $${no_of_fields_in_variants * i + 1},
            $${no_of_fields_in_variants * i + 2},
            $${no_of_fields_in_variants * i + 3},
            $${no_of_fields_in_variants * i + 4},
            $${no_of_fields_in_variants * i + 5},
            $${no_of_fields_in_variants * i + 6},
            $${no_of_fields_in_variants * i + 7})`
        )).join(", ");

        const variant_values = variants.flatMap(variant => [
            variant.sku,
            variant.color,
            variant.hex_color,
            variant.size,
            variant.original_price,
            variant.current_price,
            variant.available
        ])

        //Insert multiple variants
        const inserted_variants = await client.query(`
            INSERT INTO product_variants (
                product_id,
                sku,
                color,
                hex_color,
                size,
                original_price,
                current_price,
                available
            ) VALUES ${variant_placeholder}
              RETURNING id, sku, original_price, available;`, variant_values);


        const detail_placeholder = details.map((_, i) => (`
                (${product_id}, $${i + 1})
            `)).join(", ")

        const detail_values = details.flatMap(detail => [detail.text])

        const inserted_details = await client.query(`
                INSERT INTO product_details (product_id, text)
                VALUES ${detail_placeholder}
                RETURNING id, text;
            `, detail_values)

        await client.query(`COMMIT`)

        const data = { product, images: inserted_images.rows, variants: inserted_variants.rows, details: inserted_details.rows }

        return res.status(201).json({ success: true, data });
    } catch (error) {
        // Attempt rollback if transaction is open / failed mid-way
        try {
            await client.query(`ROLLBACK;`);
        } catch (rbErr) {
            // log rollback error only
            logger.error("Rollback failed", rbErr);
        }

        if (error.name === "ZodError") {
            // Send validation errors
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.errors,
            });
        }

        // Better error messages for unique constraint violations
        if (error && error.code === "23505") {
            // Unique violation: can inspect error.detail or error.constraint to be more specific
            logger.warn("Unique constraint violation while creating product", error);
            return res.status(409).json({ success: false, message: "Unique constraint violation (duplicate sku/slug etc)." });
        }

        logger.error("Error while adding product!!", error);
        return res.status(500).json({ message: "Error adding product" });
    } finally {
        client.release();
    }
}

export const getProducts = async (req, res) => {
    try {
        const MAX_LIMIT = 20;
        const DEFAULT_LIMIT = 12;

        const limit = Number.parseInt(req.query.limit ?? String(DEFAULT_LIMIT), 10);
        const page = Number.parseInt(req.query.page ?? "1", 10);

        if (!Number.isFinite(page) || page < 1)
            return res.status(400).json({ success: false, message: "Invalid page parameter!!" });
        if (!Number.isFinite(limit) || limit < 1 || limit > MAX_LIMIT)
            return res.status(400).json({ success: false, message: `Invalid limit parameter (1-${MAX_LIMIT})` });

        const offset = (page - 1) * limit

        const totalProducts = await sql`
            SELECT COUNT(*)::int AS total
            FROM products p
            WHERE p.status = 'active'
        `;

        const total = totalProducts?.[0]?.total ?? 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        const data = await sql`
            SELECT
                p.public_id,
                p.name,
                p.slug,
                p.short_description,
                p.current_price,
                p.average_rating,
                p.is_featured,
                pi.url,
                pi.alt_text
            FROM products p
            LEFT JOIN product_images pi ON p.main_image_id = pi.id
            WHERE p.status = 'active'
            ORDER BY p.created_at DESC, p.id DESC
            LIMIT ${limit} OFFSET ${offset}
        `
        return res.status(200).json({
            success: true,
            data,
            meta: {
                totalProducts: total,
                totalPages: totalPages,
                page,
                limit
            }
        })
    } catch (error) {
        logger.error("Error while getting product!!", error);
        return res.status(500).json({ success: false, message: "failed to fetch products" });
    }
}

export const getProductBySlug = async (req, res) => {
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
                p.original_price,
                p.current_price,
                p.sold_count,
                p.review_count,
                p.average_rating,
                p.is_featured,
                p.is_returnable,
                p.warranty_info,
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

        data['primary_image'] = data.images?.find(image => image.is_primary)
        console.log(data);

        res.status(200).json(data);
    } catch (error) {
        logger.error("Error while getting specific product!!", error);
        return res.status(500).json({ message: "Error getting product" });
    }
}

export const getRecentProducts = async (req, res) => {
    try {
        const limit = 12;

        const data = await sql`
            SELECT
                p.public_id,
                p.name,
                p.slug,
                p.current_price,
                p.average_rating,
                pi.url,
                pi.alt_text
            FROM products p
            LEFT JOIN product_images pi ON p.main_image_id = pi.id
            WHERE p.status = 'active'
            ORDER BY p.created_at DESC, p.id DESC
            LIMIT ${limit}
        `
        return res.status(200).json(data)
    } catch (error) {
        logger.error("Error while fetching recent products!!", error);
        return res.status(500).json({ message: "failed to fetch recent products" });
    }
}

export const getSearchProducts = async (req, res) => {
    try {
        const query = req.params.query.toLower() ?? ""

        const page = Number.parseInt(req.query.page ?? "1", 10);
        const limit = Number.parseInt(req.query.limit ?? String(DEFAULT_LIMIT), 10);
        const min = Number.parseInt(req.query.min ?? 0, 10);
        const max = Number.parseInt(req.query.max ?? Number.POSITIVE_INFINITY, 10);
        const sort = req.query.sort ?? "time_asc"
        const size = req.query.size ?? "all"

        const searchQuery = query.trim().split(/\s+/).join(' & ') + ':*';

        const offset = (page - 1) * limit

        const products = await sql`
            SELECT
                p.public_id,
                p.name,
                p.slug,
                p.short_description,
                p.current_price,
                p.average_rating,
                p.is_featured,
                pi.url,
                pi.alt_text
            FROM
                products p
            LEFT JOIN 
                product_images pi ON p.main_image_id = pi.id
            WHERE
                search_vector @@ to_tsquery('english', ${searchQuery}) AND p.status = 'active'
            ORDER BY
                ts_rank(search_vector, to_tsquery('english', ${searchQuery})) DESC,
                name ASC
            LIMIT ${limit}
            OFFSET ${offset};
        `;


    } catch (error) {
        logger.error("Error while fetching search products!!", error);
        return res.status(500).json({ success: false, message: "failed to fetch search prod ucts" });
    }
}

export const getProductsWithFilters = async (req, res) => {
    try {
        const MAX_LIMIT = 20;
        const DEFAULT_LIMIT = 12;

        const limit = Number.parseInt(req.query.limit ?? String(DEFAULT_LIMIT), 10);
        const page = Number.parseInt(req.query.page ?? "1", 10);
        const sort_filter = req.query.sort ?? "none";
        const size_filter = [].concat(req.query.size || []); //This is done to get array even if there is only one size selected.
        const min_filter = Number.parseInt(req.query.min ?? "0", 10)
        const max_filter = req.query.max ? Number.parseInt(req.query.max, 10) : "";
        const search_query = (req.query.search ?? "").toString().trim().replace(/\s+/g, ' ') //replace multiple spaces to single one
        console.log(search_query)

        if (!Number.isFinite(page) || page < 1)
            return res.status(400).json({ message: "Invalid page parameter!!" });
        if (!Number.isFinite(limit) || limit < 1 || limit > MAX_LIMIT)
            return res.status(400).json({ message: `Invalid limit parameter (1-${MAX_LIMIT})` });

        const offset = (page - 1) * limit

        //Get count of all filtered products to calculate pages.
        const totalProducts = await sql`
            SELECT COUNT(*)::int AS total
            FROM products p
            WHERE p.status = 'active' AND p.deleted_at IS NULL
                ${search_query ? sql`
                    AND (
                        to_tsvector('english', coalesce(p.name,'') || ' ' || coalesce(p.short_description,'')) 
                        @@ plainto_tsquery('english', ${search_query})
                        OR p.name ILIKE ${'%' + search_query + '%'}
                        OR p.short_description ILIKE ${'%' + search_query + '%'}
                    )
                ` : sql``}
                ${size_filter.length > 0 ? sql`
                    AND EXISTS (
                        SELECT 1 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.id 
                            AND pv.deleted_at IS NULL
                            AND pv.size = ANY(${size_filter})
                    )
                ` : sql``}
                ${min_filter > 0 ? sql` AND p.current_price >= ${min_filter}` : sql``}
                ${max_filter !== "" ? sql`AND p.current_price <= ${max_filter}` : sql``}
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

        //Get products with filters applied
        const data = await sql`
            SELECT
                p.public_id,
                p.name,
                p.slug,
                p.short_description,
                p.current_price,
                p.average_rating,
                p.is_featured,
                pi.url,
                pi.alt_text
            FROM products p
            LEFT JOIN product_images pi ON p.main_image_id = pi.id

            WHERE p.status = 'active'
                AND p.deleted_at IS NULL
                ${search_query ? sql`
                    AND (
                        to_tsvector('english', coalesce(p.name,'') || ' ' || coalesce(p.short_description,'')) 
                        @@ plainto_tsquery('english', ${search_query})
                        OR p.name ILIKE ${'%' + search_query + '%'}
                        OR p.short_description ILIKE ${'%' + search_query + '%'}
                    )
                ` : sql``}
                ${size_filter.length > 0 ? sql`
                    AND EXISTS (
                        SELECT 1 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.id 
                            AND pv.deleted_at IS NULL
                            AND pv.size = ANY(${size_filter})
                    )
                ` : sql``}
                ${min_filter > 0 ? sql`AND p.current_price >= ${min_filter}` : sql``}
                ${max_filter !== "" ? sql`AND p.current_price <= ${max_filter}` : sql``}

            ${sort_filter === 'price_desc' ? sql`ORDER BY p.current_price DESC NULLS LAST, p.id DESC` : sql``}
            ${sort_filter === 'price_asc' ? sql`ORDER BY p.current_price ASC NULLS LAST, p.id DESC` : sql``}
            ${sort_filter === 'time_desc' ? sql`ORDER BY p.created_at DESC, p.id DESC` : sql``}
            ${sort_filter === 'time_asc' ? sql`ORDER BY p.created_at ASC, p.id ASC` : sql``}
            ${sort_filter === 'popular' ? sql`ORDER BY p.sold_count DESC, p.id DESC` : sql``}
            ${sort_filter === 'none' || !sort_filter ? sql`ORDER BY p.created_at DESC, p.id DESC` : sql``}
            LIMIT ${limit} OFFSET ${offset}
        `;

        //Return response
        return res.status(200).json({
            data,
            meta: {
                totalProducts: total,
                totalPages: totalPages,
                page,
                limit
            }
        })
    } catch (error) {
        logger.error("Error while getting product!!", error);
        return res.status(500).json({ message: "failed to fetch products" });
    }
}

export const addProductV2 = async (req, res) => {
    const client = await pool.connect();

    try {
        const body = req.body
        const productDetailsFromBody = JSON.parse(body.details)
        const colorVariantsFromBody = JSON.parse(body.colorVariants);

        const imageMetadataFromBody = []
        let i = 0
        while (body[`imageMetadata[${i}][altText]`]) {
            imageMetadataFromBody.push({
                altText: body[`imageMetadata[${i}][altText]`],
                isPrimary: body[`imageMetadata[${i}][isPrimary]`] === 'true'
            });
            i++
        }

        console.log(imageMetadataFromBody)

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

        const parsed = adminProductSchema.parse(toBeParsed)

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
            `(${productId}, $${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`
        )).join(", ");

        const insertImageResponse = await client.query(`
                INSERT INTO product_images (
                    product_id,
                    url,
                    alt_text,
                    is_primary
                ) VALUES ${imagePlaceholder}
            `)

    } catch (error) {

    } finally {
        client.release();
    }
}