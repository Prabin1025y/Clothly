import { reviewSchema } from "../validation/review.schema.js";
import { pool } from "../config/db.js";
import logger from "../config/logger.js";

export const addReview = async (req, res) => {
    const client = await pool.connect();
    try {
        logger.debug("starting");
        const parsed = reviewSchema.parse(req.body);
        const {
            product_id,
            rating,
            title,
            body,
            images
        } = parsed;

        //testing purpose only
        const userId = req.userId

        await client.query("BEGIN");

        const data = await client.query(`
                SELECT o.id as order_id, o.status
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                WHERE o.user_id = $1 AND oi.product_id = $2
            `, [userId, product_id])

        console.log(data)

        if (data.rowCount === 0) {
            return res.status(401).json({ success: false, message: "You have not tried this product yet!!" });
        }

        const order = data.rows[0];

        const is_verified_purchase = ['delivered', 'refunded', 'returned'].includes(order.status);

        const review = await client.query(`
                INSERT INTO reviews (
                    product_id,
                    user_id,
                    order_id,
                    rating,
                    title,
                    body,
                    images,
                    is_verified_purchase
                ) values ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [
            product_id,
            userId,
            order.order_id,
            rating,
            title,
            body,
            images,
            is_verified_purchase
        ])

        await client.query("COMMIT");

        return res.status(201).json({ success: true, data: review })

    } catch (error) {
        await client.query("ROLLBACK");
        logger.error("Error in adding review: ", error)
    } finally {
        client.release()
    }
}