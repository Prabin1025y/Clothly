import { pool, sql } from "../config/db.js";
import logger from "../config/logger.js";
import orderSchema from "../validation/orders.schema.js";

export const createOrder = async (req, res) => {
    const client = await pool.connect();

    try {
        console.log(req.body)
        const parsed = orderSchema.parse(req.body);
        const { shipping_address_id, payment_method, notes, transaction_uuid } = parsed;
        const userId = req.userId || 1; //TODO: remove 1 during production
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

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

        const shippingAddressData = await client.query(`
                SELECT base_shipping_cost 
                FROM shipping_addresses
                WHERE id = $1
            `, [shipping_address_id])

        if (shippingAddressData.rowCount === 0)
            return res.status(404).json({ success: false, message: "Invalid Shipping Address!" });

        const baseShippingCost = shippingAddressData.rows[0].base_shipping_cost
        const shippingCost = payment_method === "cod" ? (+baseShippingCost) + 50.0 : (+baseShippingCost);

        await client.query("BEGIN")
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
                    notes,
                    transaction_id
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `, [
            userId,
            totalPrice,
            shippingCost,
            +(totalPrice + shippingCost).toFixed(2),
            shipping_address_id,
            shipping_address_id,
            payment_method,
            new Date(),
            notes,
            transaction_uuid
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

        if (insertedOrderItems.rowCount !== cartItems.length) {
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
}

export const getOrderItems = async (req, res) => {
    try {
        const userId = req.userId || 1; //TODO: remove 1 during production

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }


        const orderItems = await sql`
            SELECT
                oi.product_id,
                oi.public_id,
                oi.variant_id,
                oi.product_name,
                oi.quantity,
                oi.unit_price,
                oi.created_at,
                oi.status,

                o.id AS order_id,
                o.transaction_id,

                p.slug,
                pv.color,
                pv.hex_color,
                pv.size,
                pi.url,
                pi.alt_text

            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            LEFT JOIN products p ON p.id = oi.product_id
            LEFT JOIN product_variants pv ON pv.id = oi.variant_id
            LEFT JOIN LATERAL (
                SELECT url, alt_text
                FROM product_images
                WHERE product_id = oi.product_id
                AND is_primary = TRUE
                LIMIT 1
            ) pi ON TRUE

            WHERE o.user_id = ${userId} AND oi.status='paid' AND o.paid_at IS NOT NULL AND o.status='paid';
        `

        // console.log(orderItems)
        res.status(200).json(orderItems)
    } catch (error) {
        logger.error("Error while getting orders: ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getOrderItemsByTransactionId = async (req, res) => {
    try {
        const userId = req.userId || 1; //TODO: remove 1 during production
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id: transaction_id } = req.params

        const orderItems = await sql`
            SELECT
                oi.product_id,
                oi.public_id,
                oi.variant_id,
                oi.product_name,
                oi.quantity,
                oi.unit_price,
                oi.created_at,
                oi.status,
                oi.cancelled_at,

                o.id AS order_id,
                o.transaction_id,

                p.slug,
                pv.color,
                pv.hex_color,
                pv.size,
                pi.url,
                pi.alt_text

            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            LEFT JOIN products p ON p.id = oi.product_id
            LEFT JOIN product_variants pv ON pv.id = oi.variant_id
            LEFT JOIN LATERAL (
                SELECT url, alt_text
                FROM product_images
                WHERE product_id = oi.product_id
                AND is_primary = TRUE
                LIMIT 1
            ) pi ON TRUE

            WHERE 
                o.user_id = ${userId} AND 
                oi.status='paid' AND 
                o.transaction_id=${transaction_id} AND 
                o.paid_at IS NOT NULL
                AND o.status='paid';
        `

        console.log(orderItems)
        res.status(200).json(orderItems)
    } catch (error) {
        logger.error("Error while getting orders: ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const cancelOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.userId || 1 //TODO remove 1 in production
        if (!userId)
            return res.status(401).json({ message: "Unauthorized!!" });

        const { id: public_id } = req.params
        if (!public_id)
            return res.status(404).json({ message: "No such order found!!" });

        const orderItem = await sql`
            SELECT 
                oi.order_id,
                o.user_id
            FROM order_items oi
            LEFT JOIN orders o ON o.id = oi.order_id
            WHERE 
                oi.public_id = ${public_id} AND
                oi.status = 'paid'
        `
        if (orderItem.length === 0)
            return res.status(404).json({ message: "No such order found!!" });
        // console.log("Order item", orderItem)

        if (orderItem[0].user_id != userId)
            return res.status(401).json({ message: "Unauthorized!!" })

        await client.query("BEGIN");
        const cancelledOrderItemsResult = await client.query(`
                UPDATE order_items
                SET 
                    status='cancelled',
                    cancelled_at=$1,
                    updated_at=$1
                WHERE
                    public_id = $2
                RETURNING 
                    order_id,
                    unit_price,
                    quantity
            `, [new Date(), public_id])

        if (cancelledOrderItemsResult.rowCount === 0)
            throw new Error("Order item could not be cancelled!!");

        const cancelledOrderItems = cancelledOrderItemsResult.rows[0];

        const cancelledOrderResult = await client.query(`
                UPDATE orders
                SET subtotal = subtotal - $1,
                    total_amount = total_amount - $1,
                    updated_at = $2
                WHERE 
                    id=$3 AND
                    status = 'paid' AND
                    paid_at IS NOT NULL
            `, [Number(cancelledOrderItems.unit_price) * cancelledOrderItems.quantity, new Date(), cancelledOrderItems.order_id])

        if (cancelledOrderResult.rowCount === 0)
            throw new Error("Order item could not be cancelled!!");

        const remainingOrderItemData = await client.query(`
            SELECT public_id
            FROM order_items
            WHERE
                order_id = $1 AND
                status != 'cancelled'
        `, [cancelledOrderItems.order_id]);
        console.log(remainingOrderItemData)

        if (remainingOrderItemData.rowCount === 0) {
            // All order items of this order is cancelled
            console.log("Updating order with order id", cancelledOrderItems.order_id)
            await client.query(`
                    UPDATE orders 
                    SET status='cancelled'
                    WHERE id=$1
                `, [cancelledOrderItems.order_id])
        }

        // console.log(cancelledOrderItemsResult.rows)
        await client.query("COMMIT");

        res.status(200).json({ success: true });
    } catch (error) {
        client.query("ROLLBACK");
        logger.error("Error while cancelling orders: ", error);
        return res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release();
    }
}