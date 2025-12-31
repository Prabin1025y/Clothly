import { reviewSchema } from "../validation/review.schema.js";
import { pool, sql } from "../config/db.js";
import logger from "../config/logger.js";

export const addReview = async (req, res) => {
    const client = await pool.connect();
    try {
        const parsed = reviewSchema.parse(req.body);
        const {
            product_id,
            rating,
            title,
            body,
            images
        } = parsed;

        //testing purpose only
        const userId = req.userId || 1 //TODO remove this in production
        if (!userId)
            return res.status(401).json({ message: "Please log in first!!" });

        const data = await client.query(`
                SELECT o.id as order_id, o.status
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                WHERE o.user_id = $1 AND oi.product_id = $2
            `, [userId, product_id])

        console.log(data)

        if (data.rowCount === 0) {
            return res.status(401).json({ message: "You have not tried this product yet!!" });
        }

        const order = data.rows[0];

        const is_verified_purchase = ['delivered', 'refunded', 'returned'].includes(order.status);

        await client.query("BEGIN");
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
            JSON.stringify(images ?? []),
            is_verified_purchase
        ])

        if (review.rowCount === 0)
            throw new Error("No review is added!!");

        console.log(review.rows)

        await client.query("COMMIT");

        return res.status(201).json(review.rows)

    } catch (error) {
        await client.query("ROLLBACK");
        logger.error("Error in adding review: ", error)
    } finally {
        client.release()
    }
}

export const getReview = async (req, res) => {
    try {

        const productId = req.params.id
        if (!productId)
            return res.status(404).json({ message: "No such product found!!" });

        const reviews = await sql`
            SELECT 
                id,
                user_id,
                order_id,
                rating,
                title,
                body,
                images,
                is_verified_purchase,
                helpful_count,
                created_at
            FROM reviews
            WHERE product_id=${productId}
                AND deleted_at IS NULL
        `

        if (reviews.length === 0)
            return res.status(200).json([])

        // console.log(reviews);

        res.status(200).json(reviews);

    } catch (error) {
        logger.error("Error in adding review: ", error)
        res.status(500).json({
            message: process.env.NODE_ENV === 'development' ? err.message : "Internal Server Error!"
        })
    }
}