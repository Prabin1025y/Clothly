import { pool, sql } from "../config/db.js";
import logger from "../config/logger.js";
import { cartItemEditSchema, cartItemSchema } from "../validation/cartItem.schema.js";

export const addItemToCart = async (req, res) => {
    const client = await pool.connect()

    try {
        const parsed = cartItemSchema.parse(req.body);

        const { variant_id, quantity } = parsed;

        await client.query("BEGIN");

        const userId = req.userId || 1;//TODO: remove 1 during production

        const variant_data = await client.query(`
                SELECT current_price 
                FROM product_variants 
                WHERE id = $1
            `, [variant_id])

        if (variant_data.rowCount === 0)
            return res.status(404).json({ success: false, message: "No such product found" });

        const productCurrentPrice = variant_data.rows[0].current_price;

        const data = await client.query(`
                SELECT id
                FROM carts c
                WHERE c.user_id = $1 AND c.type = 'active'
            `, [userId])

        //If existing active cart is present, use it otherwise create a new onw
        let cart_id;
        if (data.rowCount === 0) {
            const today = new Date()
            today.setDate(today.getDate() + 30); //30 days
            const cart_data = await client.query(`
                    INSERT INTO carts (user_id, expires_at)
                    VALUES ($1, $2)
                    RETURNING id
                `, [userId, today.toISOString()])
            cart_id = cart_data.rows[0].id
        } else {
            cart_id = data.rows[0].id
        }

        //check if cart item has same variant id, if yess just increase updated at and quantity
        const existingCartItem = await client.query(`
                SELECT id 
                FROM cart_items 
                WHERE cart_id = $1 
                    AND variant_id = $2
            `, [cart_id, variant_id])

        let insertedCartItem;
        if (existingCartItem.rowCount === 0) {
            insertedCartItem = await client.query(`
                INSERT INTO cart_items 
                (cart_id, variant_id, quantity, price_snapshot)
                VALUES ($1, $2, $3, $4)
                RETURNING 
                    id,
                    updated_at,
                    added_at,
                    price_snapshot;
            `, [cart_id, variant_id, quantity, productCurrentPrice])
        } else {
            const cartItemId = existingCartItem.rows[0].id;
            insertedCartItem = await client.query(`
                    UPDATE cart_items 
                    SET 
                        quantity = quantity + $1,
                        updated_at = NOW()
                    WHERE id = $2
                    RETURNING 
                        id,
                        updated_at,
                        added_at,
                        price_snapshot;
                `, [quantity, cartItemId])
        }

        if (insertedCartItem.rowCount === 0)
            throw new Error("No data inserted!!");

        await client.query(`
                UPDATE carts
                SET total_price = total_price + $1
                WHERE id = $2
            `, [quantity * productCurrentPrice, cart_id])

        const otherData = await client.query(`
                SELECT 
                    pv.product_id,
                    p.name AS product_name,
                    p.slug,
                    pi.url,
                    pi.alt_text
                FROM product_variants pv
                JOIN products p 
                    ON p.id = pv.product_id
                LEFT JOIN product_images pi 
                    ON pi.product_id = pv.product_id 
                    AND pi.is_primary = TRUE
                WHERE pv.id = $1
                LIMIT 1;
            `, [variant_id])

        // console.log("other data: ", otherData.rows[0])
        // console.log("cart data: ", insertedCartItem.rows[0])
        const finalData = {
            product_name: otherData.rows[0].product_name,
            product_slug: otherData.rows[0].slug,
            id: Number(insertedCartItem.rows[0].id),
            variant_id: variant_id,
            quantity: quantity,
            price_snapshot: Number(insertedCartItem.rows[0].price_snapshot),
            added_at: insertedCartItem.rows[0].added_at,
            updated_at: insertedCartItem.rows[0].updated_at,
            product_image_alt_text: otherData.rows[0].alt_text,
            product_image_url: otherData.rows[0].url
        }

        await client.query("COMMIT");

        return res.status(201).json(finalData);
    } catch (error) {
        await client.query("ROLLBACK");
        logger.error("Error while adding item to cart: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" })
    } finally {
        client.release();
    }
}

export const editItemInCart = async (req, res) => {
    const client = await pool.connect();

    try {
        const parsed = cartItemEditSchema.parse(req.body);
        const { variant_id, old_variant_id, quantity } = parsed;
        // console.log(parsed)

        await client.query("BEGIN");

        const userId = req.userId || 2; //TODO remove 1 in production

        const currentCart = await client.query(`
                SELECT id
                FROM carts
                WHERE user_id = $1
                    AND type = 'active'
            `, [userId])

        if (currentCart.rowCount === 0)
            return res.status(404).json({ message: "No such cart found1!!" });

        const cartId = currentCart.rows[0].id;

        // console.log([variant_id, cartId, old_variant_id, quantity]);

        const updateCart = await client.query(`
                WITH old_item AS (
                    SELECT 
                        ci.id,
                        ci.quantity AS old_quantity,
                        ci.price_snapshot AS old_price,
                        pv.current_price AS new_price
                    FROM cart_items ci
                    JOIN product_variants pv ON pv.id = $1
                    WHERE ci.cart_id = $2
                        AND ci.variant_id = $3
                )
                UPDATE cart_items ci
                SET
                    quantity = $4,
                    variant_id = $1,
                    price_snapshot = old_item.new_price,
                    updated_at = NOW()
                FROM old_item
                WHERE ci.id = old_item.id
                RETURNING
                    (old_item.old_quantity * old_item.old_price) AS old_total,
                    ($4 * old_item.new_price) AS new_total;
                
            `, [variant_id, cartId, old_variant_id, quantity]);

        if (updateCart.rowCount === 0) {
            await client.query("ROLLBACK");
            // console.log(updateCart)
            return res.status(404).json({ message: "No such cart found2!!" });
        }

        const { old_total, new_total } = updateCart.rows[0];

        await client.query(`
                UPDATE carts
                SET
                    total_price = total_price - $1 + $2
                WHERE id = $3;
            `, [old_total, new_total, cartId]);

        await client.query("COMMIT");

        return res.status(201).json({
            success: true,
            data: updateCart.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");
        logger.error("Error while editing cart item: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    } finally {
        client.release();
    }
};

export const getCurrentCartItemByUserId = async (req, res) => {
    try {
        const userId = req.userId || 2;

        const cartItems = await sql`
            SELECT
                c.id AS cart_id,
                c.user_id,
                c.type,
                c.total_price,
                COALESCE(
                    jsonb_agg(item_data) FILTER (WHERE item_data IS NOT NULL),
                    '[]'
                ) AS items
            FROM carts c
            LEFT JOIN (
                SELECT
                    ci.cart_id,
                    jsonb_build_object(
                        'variant_id', ci.variant_id,
                        'quantity', SUM(ci.quantity),
                        'price_snapshot', ci.price_snapshot,
                        'product_name', p.name,
                        'cart_item_id', ci.id,
                        'product_slug', p.slug,
                        'product_image_url', pi.url,
                        'product_image_alt_text', pi.alt_text,
                        'added_at', MIN(ci.added_at),
                        'updated_at', MAX(ci.updated_at)
                    ) AS item_data
                FROM cart_items ci
                JOIN product_variants pv ON pv.id = ci.variant_id
                JOIN products p ON p.id = pv.product_id

                JOIN LATERAL (
                    SELECT url, alt_text
                    FROM product_images
                    WHERE product_id = pv.product_id
                    AND is_primary = TRUE
                    LIMIT 1
                ) pi ON TRUE

                GROUP BY
                    ci.cart_id,
                    ci.id,
                    ci.variant_id,
                    ci.price_snapshot,
                    p.name,
                    p.slug,
                    pi.url,
                    pi.alt_text
            ) merged_items
            ON merged_items.cart_id = c.id
            WHERE c.user_id = ${userId}
            AND c.type = 'active'
            GROUP BY c.id;
        `
        // console.log(cartItems)
        return res.status(200).json({ success: true, data: cartItems[0] });
    } catch (error) {
        logger.error("Error while getting cart item: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const deleteItemFromCart = async (req, res) => {
    const client = await pool.connect()
    try {
        await client.query("BEGIN");
        const userId = req.userId || 1;
        // console.log(userId)

        const productVariantId = req.params.variantId;

        if (!productVariantId)
            throw new Error("Invalid Product variant id!");

        const deletedItem = await client.query(`
            DELETE FROM cart_items ci
            USING carts c
            WHERE ci.cart_id = c.id
                AND c.user_id = $1
                AND ci.variant_id = $2
            RETURNING ci.*;
        `, [userId, productVariantId])

        // console.log(deletedItem);

        if (deletedItem.rowCount > 0) {
            const deletedPrice = deletedItem.rows.reduce((price, row) => price + Number(row.price_snapshot) * row.quantity, 0)
            await client.query(`
            UPDATE carts
                SET total_price = total_price - $1
                WHERE id = $2 
            `, [deletedPrice, deletedItem.rows[0].cart_id]);
        }
        await client.query("COMMIT");
        return res.status(200).json({ success: true, data: deletedItem.rows })


    } catch (error) {
        await client.query("ROLLBACK");
        logger.error("Error while getting cart item: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" })
    } finally {
        client.release();
    }
}

export const getCartItemDetail = async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const userId = req.userId || 1;

        // const queryResult = await sql`
        //     WITH target_variant AS (
        //         SELECT
        //             pv.id AS variant_id,
        //             pv.product_id,
        //             pv.current_price,
        //             pv.original_price,
        //             pv.size,
        //             pv.color,
        //             pv.available
        //         FROM product_variants pv
        //         WHERE pv.id = ${productVariantId}
        //         ),

        //         product_info AS (
        //             SELECT 
        //             p.id AS product_id,
        //             p.name,
        //             p.short_description
        //             FROM products p
        //         JOIN target_variant tv ON p.id = tv.product_id
        //         ),

        //     primary_image AS (
        //         SELECT 
        //             pi.product_id,
        //             pi.url,
        //             pi.alt_text
        //             FROM product_images pi
        //             JOIN target_variant tv ON tv.product_id = pi.product_id
        //             WHERE pi.is_primary = TRUE
        //             LIMIT 1
        //     ),

        //     cart_item AS (
        //         SELECT
        //             ci.id AS cart_item_id,
        //             ci.quantity
        //         FROM carts c
        //         JOIN cart_items ci ON ci.cart_id = c.id
        //         JOIN target_variant tv ON tv.variant_id = ci.variant_id
        //         WHERE c.user_id = ${userId}
        //         AND c.type = 'active'
        //         LIMIT 1
        //     ),

        //     other_variants AS (
        //         SELECT 
        //             pv.product_id,
        //             pv.color,
        //             jsonb_agg(
        //                 jsonb_build_object(
        //                     'variant_id', pv.id,
        //                     'size', pv.size,
        //                     'available', pv.available,
        //                     'current_price', pv.current_price
        //                 )
        //                 ORDER BY pv.size
        //             ) AS sizes
        //         FROM product_variants pv
        //         JOIN target_variant tv ON tv.product_id = pv.product_id
        //         GROUP BY pv.product_id, pv.color
        //     )

        //     SELECT
        //         -- product
        //         pi.name,
        //         pi.short_description,

        //         -- selected variant
        //         tv.variant_id,
        //         tv.current_price,
        //         tv.original_price,
        //         tv.size,
        //         tv.color,
        //         tv.available,

        //         -- user cart info
        //         COALESCE(ci.quantity, 0) AS cart_quantity,
        //         ci.cart_item_id,

        //         -- primary image
        //         img.url AS primary_image_url,
        //         img.alt_text AS primary_image_alt_text,

        //         -- grouped variants list
        //         jsonb_agg(
        //             jsonb_build_object(
        //                 'color', ov.color,
        //                 'sizes', ov.sizes
        //             )
        //             ORDER BY ov.color
        //         ) AS all_variants
        //     FROM product_info pi
        //     JOIN target_variant tv ON TRUE
        //     LEFT JOIN cart_item ci ON TRUE
        //     LEFT JOIN primary_image img ON TRUE
        //     LEFT JOIN other_variants ov ON ov.product_id = pi.product_id
        //     GROUP BY 
        //         pi.name, 
        //         pi.short_description,
        //         tv.variant_id,
        //         tv.current_price,
        //         tv.original_price,
        //         tv.size,
        //         tv.color,
        //         tv.available,
        //         img.url,
        //         img.alt_text,
        //         ci.quantity,
        //         ci.cart_item_id;
        //         `;

        const queryResult = await sql`
            WITH target_cart_item AS (
                SELECT
                    ci.id AS cart_item_id,
                    ci.quantity,
                    ci.variant_id
                FROM carts c
                JOIN cart_items ci ON ci.cart_id = c.id
                WHERE ci.id = ${cartItemId}
                AND c.user_id = ${userId}
                AND c.type = 'active'
            ),

            target_variant AS (
                SELECT
                    pv.id AS variant_id,
                    pv.product_id,
                    pv.current_price,
                    pv.original_price,
                    pv.size,
                    pv.color,
                    pv.available
                FROM product_variants pv
                JOIN target_cart_item tci ON tci.variant_id = pv.id
            ),

            product_info AS (
                SELECT 
                    p.id AS product_id,
                    p.name,
                    p.short_description
                FROM products p
                JOIN target_variant tv ON p.id = tv.product_id
            ),

            primary_image AS (
                SELECT 
                    pi.product_id,
                    pi.url,
                    pi.alt_text
                FROM product_images pi
                JOIN target_variant tv ON tv.product_id = pi.product_id
                WHERE pi.is_primary = TRUE
                LIMIT 1
            ),

            other_variants AS (
                SELECT 
                    pv.product_id,
                    pv.color,
                    jsonb_agg(
                        jsonb_build_object(
                            'variant_id', pv.id,
                            'size', pv.size,
                            'available', pv.available,
                            'current_price', pv.current_price
                        )
                        ORDER BY pv.size
                    ) AS sizes
                FROM product_variants pv
                JOIN target_variant tv ON tv.product_id = pv.product_id
                GROUP BY pv.product_id, pv.color
            )

            SELECT
                -- product
                pi.name,
                pi.short_description,

                -- selected variant
                tv.variant_id,
                tv.current_price,
                tv.original_price,
                tv.size,
                tv.color,
                tv.available,

                -- user cart info
                tci.quantity AS cart_quantity,
                tci.cart_item_id,

                -- primary image
                img.url AS primary_image_url,
                img.alt_text AS primary_image_alt_text,

                -- grouped variants list
                jsonb_agg(
                    jsonb_build_object(
                        'color', ov.color,
                        'sizes', ov.sizes
                    )
                    ORDER BY ov.color
                ) AS all_variants

            FROM product_info pi
            JOIN target_variant tv ON TRUE
            JOIN target_cart_item tci ON TRUE
            LEFT JOIN primary_image img ON TRUE
            LEFT JOIN other_variants ov ON ov.product_id = pi.product_id

            GROUP BY 
                pi.name, 
                pi.short_description,
                tv.variant_id,
                tv.current_price,
                tv.original_price,
                tv.size,
                tv.color,
                tv.available,
                img.url,
                img.alt_text,
                tci.quantity,
                tci.cart_item_id;
            `;


        console.log(queryResult?.[0])

        res.status(200).json(queryResult?.[0])
    } catch (error) {
        // await client.query("ROLLBACK");
        logger.error("Error while getting cart item: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" })

    }
}