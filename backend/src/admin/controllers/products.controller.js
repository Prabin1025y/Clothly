import { sql } from "../../config/db.js";
import logger from "../../config/logger.js";

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

