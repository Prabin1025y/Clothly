import { Router } from "express";
import { sql } from "../../config/db.js";
import logger from "../../config/logger.js";
import { productSchema } from "../../validation/product.schema.js";

const productsRouter = Router()

productsRouter.post("/add-product", async (req, res) => {

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
        created_by = 2
    } = parsed

    try {

        await sql`BEGIN`

        const inserted_product = await sql`
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
                ${name},
                ${sku},
                ${slug},
                ${short_description},
                ${description},
                ${status},
                ${original_price},
                ${current_price ? current_price : original_price},
                ${currency},
                ${is_featured},
                ${is_returnable},
                ${warranty_info},
                ${created_by}
            ) RETURNING id public_id, name, sku, slug, current_price;
        `

        const product = inserted_product[0]

        if (!product) throw new Error("Failed to insert product");

        const product_id = product.id


        const inserted_images = await sql`
            INSERT INTO product_images (product_id, url,alt_text, is_primary)
            VALUES ${sql(images.map(image => sql`(${product_id}, ${image.url}, ${image.alt_text}, ${Boolean(image.is_primary)})`))}
            RETURNING id, url, alt_text, is_primary;
            `

        const primary_image_id = inserted_images.find(row => row.is_primary === true).id

        if (primary_image_id)
            await sql`
            UPDATE products 
            SET main_image_id = ${primary_image_id}
            WHERE id = ${product_id};
            `

        await sql`
            INSERT INTO product_variants (
                product_id,
                sku,
                color,
                size,
                original_price,
                current_price,
                available
            ) VALUES 
            ${sql(variants.map(variant => sql`
                (
                    ${product_id},
                    ${variant.sku},
                    ${variant.color},
                    ${variant.size},
                    ${variant.original_price},
                    ${variant.current_price ? variant.current_price : variant.original_price},
                    ${variant.available}
                )
            `))} RETURNING id;
        `

        await sql`COMMIT`

        res.status(201).json({ success: true, message: "Product added" });
    } catch (error) {
        // Attempt rollback if transaction is open / failed mid-way
        try {
            await sql`ROLLBACK;`;
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
    }


})

export default productsRouter