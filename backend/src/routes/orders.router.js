import { Router } from "express";
import { pool, sql } from "../config/db.js";
import orderSchema from "../validation/orders.schema.js";
import logger from "../config/logger.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const orderRouter = Router()

orderRouter.post("/create-order", isAuthenticated, async (req, res) => {
    const client = await pool.connect();

    try {
        const parsed = orderSchema.parse(req.body);
        const { shipping_address_id, payment_method, notes } = parsed;
        await client.query("BEGIN")
        const userId = req.userId || 2; //TODO: remove 1 during production

        const cart = await client.query(`SELECT id FROM carts WHERE user_id = $1 AND type='active'`, [userId])
        if (cart.rowCount == 0)
            return res.status(404).json({ success: false, message: "No such cart found!" })

        const cart_id = cart.rows[0].id


        const cartItemsData = await client.query(`
                SELECT 
                    ci.id, 
                    ci.variant_id, 
                    ci.quantity, 
                    ci.price_snapshot AS unit_price, 
                    pv.product_id,
                    p.name AS product_name
                FROM cart_items ci
                JOIN carts c ON ci.cart_id = c.id
                JOIN product_variants pv ON ci.variant_id = pv.id
                JOIN products p ON pv.product_id = p.id
                WHERE ci.cart_id = $1 AND c.user_id = $2
            `, [cart_id, userId])

        if (cartItemsData.rowCount === 0)
            return res.status(404).json({ success: false, message: "Your cart is empty!" })

        const cartItems = cartItemsData.rows

        const totalPrice = cartItems.reduce((prevValue, element) => (prevValue + element.quantity * element.unit_price), 0)
        console.log(cartItemsData)

        const shippingAddressData = await client.query(`
                SELECT base_shipping_cost 
                FROM shipping_addresses
                WHERE id = $1
            `, [shipping_address_id])

        if (shippingAddressData.rowCount === 0)
            return res.status(404).json({ success: false, message: "Invalid Shipping Address!" });

        const baseShippingCost = shippingAddressData.rows[0].base_shipping_cost
        const shippingCost = payment_method === "cod" ? (+baseShippingCost) + 50.0 : (+baseShippingCost);

        console.log(payment_method === "cod")
        console.log(shippingCost)

        const createdOrder = await client.query(`
                INSERT INTO orders (
                    user_id,
                    subtotal,
                    shipping_cost,
                    total_amount,
                    shipping_address_id,
                    billing_address_id,
                    payment_method,
                    placed_at,
                    notes
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id
            `, [
            userId,
            totalPrice,
            shippingCost,
            totalPrice,
            shipping_address_id,
            shipping_address_id,
            payment_method,
            new Date(),
            notes
        ]);

        if (createdOrder.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(500).json({ success: false, message: "Failed to place order!" })
        }

        const orderId = createdOrder.rows[0].id
        const noOfData = 5
        const orderItemPlaceholder = cartItems.map((_, i) => (`
            (${orderId}, $${noOfData * i + 1}, $${noOfData * i + 2}, $${noOfData * i + 3}, $${noOfData * i + 4}, $${noOfData * i + 5})
            `)).join(", ");

        const orderItemValues = cartItems.flatMap(item => [
            item.product_id,
            item.variant_id,
            item.product_name,
            item.quantity,
            item.unit_price
        ])

        const insertedOrderItems = await client.query(`
                INSERT INTO order_items (
                    order_id,
                    product_id,
                    variant_id,
                    product_name,
                    quantity,
                    unit_price
                )
                VALUES ${orderItemPlaceholder}
            `, orderItemValues);

        if (insertedOrderItems.rowCount > 0) {
            await client.query(`
                DELETE FROM carts WHERE id = $1
                `, [cart_id])
        } else {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Order was not placed for some reason!" })
        }

        await client.query("COMMIT");

        return res.status(201).json({ success: true });

    } catch (error) {
        await client.query("ROLLBACK");
        logger.error("Error while creating as order: ", error);
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        client.release()
    }
})

orderRouter.get("/order-items", async (req, res) => {
    try {
        const userId = req.userId || 2; //TODO: remove 1 during production

        const orderIds = await sql`
            SELECT id FROM orders WHERE user_id=${userId}
        `;
        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            res.status(200).json([]);
        }

        console.log(orderIds)

        const orderItems = await sql`
            SELECT
                oi.product_id,
                oi.variant_id,
                oi.product_name,
                oi.quantity,
                oi.unit_price,
                oi.created_at,

                p.slug,
                pv.color,
                pv.size,
                pi.url,
                pi.alt_text

            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            JOIN product_variants pv ON pv.id = oi.variant_id
            LEFT JOIN product_images pi
                ON pi.product_id = oi.product_id
            AND pi.is_primary = TRUE

            WHERE oi.order_id = ANY(${orderIds.map(o => o.id)});

        `

        console.log(orderItems)
        res.status(201).json({ success: true })
    } catch (error) {
        logger.error("Error while getting orders: ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

export default orderRouter;
