import { success } from "zod";
import { pool, sql } from "../../config/db.js";
import logger from "../../config/logger.js";
import { productSchema } from "../../validation/product.schema.js";

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
        const no_of_fields_in_variants = 6
        const variant_placeholder = variants.map((_, i) => (
            `(${product_id},
            $${no_of_fields_in_variants * i + 1},
            $${no_of_fields_in_variants * i + 2},
            $${no_of_fields_in_variants * i + 3},
            $${no_of_fields_in_variants * i + 4},
            $${no_of_fields_in_variants * i + 5},
            $${no_of_fields_in_variants * i + 6})`
        )).join(", ");

        const variant_values = variants.flatMap(variant => [
            variant.sku,
            variant.color,
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
        return res.status(500).json({ success: false, message: "Error adding product" });
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
        logger.error("Error while adding product!!", error);
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
                pi.url AS image_urls,
                pi.alt_text,
                pi.is_primary,
                pv.sku AS variant_sku,
                pv.color,
                pv.size,
                pv.available,
                pd.text
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            LEFT JOIN product_details pd ON p.id = pd.product_id 
            WHERE p.slug = ${slug} AND p.status = 'active' AND pv.available > 0
        `

        if (result.length === 0)
            return res.status(404).json({ success: false, message: "No such product found." });

        const data = result?.[0]

        console.log(data);
        res.send(data);
    } catch (error) {
        logger.error("Error while getting product!!", error);
        return res.status(500).json({ success: false, message: "Error getting product" });
    }
}