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

export const getOrders = async (req, res) => {
    try {
        const LIMIT = 20;

        // Parse and validate query parameters
        const page = Number.parseInt(req.query.page ?? "1", 10);
        const sort_filter = req.query.sort ?? "date_desc";
        const status_filter = [].concat(req.query.status || []);
        const search_query = (req.query.search ?? "").toString().trim().replace(/\s+/g, ' ');

        // Validation
        const valid_status = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned', 'expired'];
        const valid_sort = ['date_asc', 'date_desc', 'price_asc', 'price_desc'];

        // Validate status filters
        for (const status of status_filter) {
            if (!valid_status.includes(String(status).toLowerCase().trim())) {
                return res.status(400).json({ message: "Invalid status filter!!" });
            }
        }

        // Validate sort filter
        if (!valid_sort.includes(String(sort_filter).toLowerCase().trim())) {
            return res.status(400).json({ message: "Invalid sort filter!!" });
        }

        // Validate page
        if (!Number.isFinite(page) || page < 1) {
            return res.status(400).json({ message: "Invalid page parameter!!" });
        }

        const offset = (page - 1) * LIMIT;
        const status = status_filter.length > 0 ? status_filter : valid_status;

        // Build search condition - reusable for both queries
        const searchCondition = search_query ? sql`
            AND EXISTS (
                SELECT 1
                FROM order_items oi2
                LEFT JOIN products p2 ON p2.id = oi2.product_id
                WHERE oi2.order_id = o.id
                AND (
                    to_tsvector('english', coalesce(p2.name,'') || ' ' || coalesce(p2.short_description,'')) 
                    @@ plainto_tsquery('english', ${search_query})
                    OR p2.name ILIKE ${'%' + search_query + '%'}
                    OR p2.short_description ILIKE ${'%' + search_query + '%'}
                )
            )
        ` : sql``;

        // Get count of all filtered orders
        const totalOrdersResult = await sql`
            SELECT COUNT(DISTINCT o.id)::int AS total
            FROM orders o
            WHERE o.status = ANY(${status})
                ${searchCondition}
        `;

        const total = totalOrdersResult?.[0]?.total ?? 0;

        if (total === 0) {
            return res.status(200).json({
                data: [],
                meta: {
                    totalOrders: 0,
                    totalPages: 1,
                    page: 1,
                    limit: LIMIT
                }
            });
        }

        const totalPages = Math.max(1, Math.ceil(total / LIMIT));

        // Get orders with their IDs first (with pagination and sorting)
        const orderIds = await sql`
            SELECT o.id
            FROM orders o
            WHERE o.status = ANY(${status})
                ${searchCondition}
            ${sort_filter === 'price_desc' ? sql`ORDER BY o.total_amount DESC NULLS LAST, o.id DESC` : sql``}
            ${sort_filter === 'price_asc' ? sql`ORDER BY o.total_amount ASC NULLS LAST, o.id DESC` : sql``}
            ${sort_filter === 'date_desc' ? sql`ORDER BY o.created_at DESC, o.id DESC` : sql``}
            ${sort_filter === 'date_asc' ? sql`ORDER BY o.created_at ASC, o.id ASC` : sql``}
            LIMIT ${LIMIT} OFFSET ${offset}
        `;

        if (orderIds.length === 0) {
            return res.status(200).json({
                data: [],
                meta: {
                    totalOrders: total,
                    totalPages: totalPages,
                    page,
                    limit: LIMIT
                }
            });
        }

        const orderIdList = orderIds.map(row => row.id);

        // Get full order details with all items
        const ordersWithItems = await sql`
            SELECT
                o.id AS order_id,
                o.public_id AS order_public_id,
                o.transaction_id,
                o.subtotal,
                o.shipping_cost,
                o.tax_amount,
                o.discount_amount,
                o.total_amount,
                o.status AS order_status,
                o.currency,
                o.payment_method,
                o.placed_at,
                o.paid_at,
                o.shipped_at,
                o.delivered_at,
                o.notes,
                o.created_at AS order_created_at,
                o.updated_at AS order_updated_at,

                oi.id AS item_id,
                oi.public_id AS item_public_id,
                oi.product_id,
                oi.variant_id,
                oi.product_name,
                oi.status AS item_status,
                oi.quantity,
                oi.unit_price,
                oi.cancelled_at,
                oi.created_at AS item_created_at,
                (oi.unit_price * oi.quantity) AS item_total_price,

                p.slug AS product_slug,
                p.name AS product_name,
                p.short_description AS product_description,
                
                pv.color,
                pv.hex_color,
                pv.size,
                
                pi.url AS image_url,
                pi.alt_text AS image_alt_text

            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN products p ON p.id = oi.product_id
            LEFT JOIN product_variants pv ON pv.id = oi.variant_id
            LEFT JOIN LATERAL (
                SELECT url, alt_text
                FROM product_images
                WHERE product_id = oi.product_id
                AND is_primary = TRUE
                LIMIT 1
            ) pi ON TRUE

            WHERE o.id = ANY(${orderIdList})
           ${sort_filter === 'price_desc' ? sql`ORDER BY o.total_amount DESC NULLS LAST, o.id DESC` : sql``}
            ${sort_filter === 'price_asc' ? sql`ORDER BY o.total_amount ASC NULLS LAST, o.id DESC` : sql``}
            ${sort_filter === 'date_desc' ? sql`ORDER BY o.created_at DESC, o.id DESC` : sql``}
            ${sort_filter === 'date_asc' ? sql`ORDER BY o.created_at ASC, o.id ASC` : sql``}
        `;

        // Transform flat results into nested structure
        const ordersMap = new Map();

        for (const row of ordersWithItems) {
            const orderId = row.order_id;

            // Initialize order if not exists
            if (!ordersMap.has(orderId)) {
                ordersMap.set(orderId, {
                    id: row.order_id,
                    public_id: row.order_public_id,
                    transaction_id: row.transaction_id,
                    subtotal: row.subtotal,
                    shipping_cost: row.shipping_cost,
                    tax_amount: row.tax_amount,
                    discount_amount: row.discount_amount,
                    total_amount: row.total_amount,
                    status: row.order_status,
                    currency: row.currency,
                    payment_method: row.payment_method,
                    placed_at: row.placed_at,
                    paid_at: row.paid_at,
                    shipped_at: row.shipped_at,
                    delivered_at: row.delivered_at,
                    notes: row.notes,
                    created_at: row.order_created_at,
                    updated_at: row.order_updated_at,
                    items: []
                });
            }

            // Add order item if exists (handle case where order has no items)
            if (row.item_id) {
                const order = ordersMap.get(orderId);
                order.items.push({
                    id: row.item_id,
                    public_id: row.item_public_id,
                    product_id: row.product_id,
                    variant_id: row.variant_id,
                    product_name: row.product_name,
                    status: row.item_status,
                    quantity: row.quantity,
                    unit_price: row.unit_price,
                    total_price: row.item_total_price,
                    cancelled_at: row.cancelled_at,
                    created_at: row.item_created_at,
                    product: {
                        slug: row.product_slug,
                        name: row.product_name,
                        description: row.product_description
                    },
                    variant: row.variant_id ? {
                        color: row.color,
                        hex_color: row.hex_color,
                        size: row.size
                    } : null,
                    image: row.image_url ? {
                        url: row.image_url,
                        alt_text: row.image_alt_text
                    } : null
                });
            }
        }

        // Convert map to array
        const data = Array.from(ordersMap.values());

        // Return response
        return res.status(200).json({
            data,
            meta: {
                totalOrders: total,
                totalPages: totalPages,
                page,
                limit: LIMIT
            }
        });

    } catch (error) {
        console.log(error)
        logger.error("Error while getting orders!!", error);
        return res.status(500).json({ message: "Failed to fetch orders" });
    }
};

// export const getOrders = async (req, res) => {

//     try {
//         const LIMIT = 20;

//         // const limit = Number.parseInt(req.query.limit ?? String(DEFAULT_LIMIT), 10);
//         const page = Number.parseInt(req.query.page ?? "1", 10);
//         const sort_filter = req.query.sort ?? "date_desc";
//         const status_filter = [].concat(req.query.status || []);
//         // const size_filter = [].concat(req.query.size || []); //This is done to get array even if there is only one size selected.
//         // const min_filter = Number.parseInt(req.query.min ?? "0", 10)
//         // const max_filter = req.query.max ? Number.parseInt(req.query.max, 10) : "";
//         const search_query = (req.query.search ?? "").toString().trim().replace(/\s+/g, ' ') //replace multiple spaces to single one
//         console.log(search_query)

//         const valid_status = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned', 'expired']
//         status_filter.forEach(status => {
//             if (!valid_status.includes(String(status).toLowerCase().trim()))
//                 return res.status(400).json({ message: "Invalid status filter!!" })
//         })

//         const valid_sort = ['date_asc', 'date_desc', 'price_asc', 'price_desc']
//         if (!valid_sort.includes(String(sort_filter).toLowerCase().trim()))
//             return res.status(400).json({ message: "Invalid sort filter!!" })

//         if (!Number.isFinite(page) || page < 1)
//             return res.status(400).json({ message: "Invalid page parameter!!" });

//         const offset = (page - 1) * LIMIT
//         const status = status_filter.length > 0 ? status_filter : valid_status;

//         //Get count of all filtered products to calculate pages.
//         const totalOrders = await sql`
//             SELECT COUNT(*)::int AS total
//             FROM orders
//             LEFT JOIN order_items oi ON oi.order_id = o.id
//             LEFT JOIN products p ON p.id = oi.product_id
//             WHERE oi.status = ANY(${status}) AND o.status = ANY(${status})
//                 ${search_query ? sql`
//                     AND (
//                         to_tsvector('english', coalesce(p.name,'') || ' ' || coalesce(p.short_description,''))
//                         @@ plainto_tsquery('english', ${search_query})
//                         OR p.name ILIKE ${'%' + search_query + '%'}
//                         OR p.short_description ILIKE ${'%' + search_query + '%'}
//                     )
//                 ` : sql``}
//         `;

//         if (totalOrders.length === 0)
//             return res.status(200).json({
//                 data: [],
//                 meta: {
//                     totalOrders: 0,
//                     totalPages: 1,
//                     page: 1,
//                     limit: LIMIT
//                 }
//             })

//         const total = totalOrders?.[0]?.total ?? 0;
//         const totalPages = Math.max(1, Math.ceil(total / LIMIT));

//         //Get products with filters applied
//         const data = await sql`
//             SELECT
//                 oi.product_id,
//                 oi.public_id,
//                 oi.variant_id,
//                 oi.product_name,
//                 oi.quantity,
//                 oi.unit_price,
//                 oi.created_at,
//                 oi.status,

//                 o.id AS order_id,
//                 o.transaction_id,


//                 p.slug,
//                 pv.color,
//                 pv.hex_color,
//                 pv.size,
//                 pi.url,
//                 pi.alt_text

//             FROM orders o
//             LEFT JOIN order_items oi ON oi.order_id = o.id
//             LEFT JOIN products p ON p.id = oi.product_id
//             LEFT JOIN product_variants pv ON pv.id = oi.variant_id
//             LEFT JOIN LATERAL (
//                 SELECT url, alt_text
//                 FROM product_images
//                 WHERE product_id = oi.product_id
//                 AND is_primary = TRUE
//                 LIMIT 1
//             ) pi ON TRUE

//             WHERE oi.status = ANY(${status}) AND o.status = ANY(${status})
//             ${search_query ? sql`
//                     AND (
//                         to_tsvector('english', coalesce(p.name,'') || ' ' || coalesce(p.short_description,''))
//                         @@ plainto_tsquery('english', ${search_query})
//                         OR p.name ILIKE ${'%' + search_query + '%'}
//                         OR p.short_description ILIKE ${'%' + search_query + '%'}
//                     )
//                 ` : sql``}
//             ${sort_filter === 'price_desc' ? sql`ORDER BY (oi.unit_price * oi.quantity) DESC NULLS LAST, oi.id DESC` : sql``}
//             ${sort_filter === 'price_asc' ? sql`ORDER BY (oi.unit_price * oi.quantity) ASC NULLS LAST, oi.id DESC` : sql``}
//             ${sort_filter === 'date_desc' ? sql`ORDER BY oi.created_at DESC, oi.id DESC` : sql``}
//             ${sort_filter === 'date_asc' ? sql`ORDER BY oi.created_at ASC, oi.id ASC` : sql``}
//             GROUP BY o.id
//             LIMIT ${LIMIT} OFFSET ${offset};
//         `;

//         //Return response
//         return res.status(200).json({
//             data,
//             meta: {
//                 totalOrders: total,
//                 totalPages: totalPages,
//                 page,
//                 limit: LIMIT
//             }
//         })
//     } catch (error) {
//         console.log(error)
//         logger.error("Error while getting orders!!", error);
//         return res.status(500).json({ message: "failed to fetch orders" });
//     }
// }