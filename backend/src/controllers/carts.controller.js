import { pool } from "../../config/db.js";
import logger from "../../config/logger.js";
import { cartItemSchema } from "../../validation/cartItem.schema.js";

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
            console.log(cart_data)
            cart_id = cart_data.rows[0].id
        } else {
            cart_id = data.rows[0].id
            console.log(cart_id)
        }

        const insertedCartItems = await client.query(`
                INSERT INTO cart_items 
                (cart_id, variant_id, quantity, price_snapshot)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `, [cart_id, variant_id, quantity, productCurrentPrice])

        await client.query(`
                UPDATE carts
                SET total_price = total_price + $1
                WHERE id = $2
            `, [quantity * productCurrentPrice, cart_id])

        await client.query("COMMIT");

        return res.status(201).json({ success: true, data: insertedCartItems });
    } catch (error) {
        await client.query("ROLLBACK");
        logger.error("Error while adding item to cart: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" })
    } finally {
        client.release();
    }
}