import { addReviewSchema } from "../validation/review.schema.js";
import { pool, sql } from "../config/db.js";
import logger from "../config/logger.js";
import { getAuth } from "@clerk/express";

export const addReview = async (req, res) => {
    const client = await pool.connect();
    try {
        const formData = {
            product_id: parseInt(req.body.product_id),
            rating: parseInt(req.body.rating),
            title: req.body.title,
            body: req.body.body,
            imageUrl: req.file ? `${process.env.BACKEND_URL}/uploads/${req.file.filename}` : ""
        };
        // console.log(req.file)

        const parsed = addReviewSchema.parse(formData);
        const {
            product_id,
            rating,
            title,
            body,
            imageUrl
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

        // console.log(data)

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
            JSON.stringify(imageUrl ? [{
                imageUrl,
                alt_text: "review Image of product"
            }] : []),
            is_verified_purchase
        ])

        if (review.rowCount === 0)
            throw new Error("No review is added!!");

        await client.query("COMMIT");

        return res.status(201).json({ product_id: product_id.toString() })

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

        const { userId } = getAuth(req)

        const reviews = await sql`
            SELECT 
                rv.id,
                rv.user_id,
                ur.clerk_id,
                ur.full_name,
                ur.image_url,
                rv.order_id,
                rv.product_id,
                rv.rating,
                rv.title,
                rv.body,
                rv.images,
                rv.is_verified_purchase,
                rv.helpful_count,
                rv.created_at
            FROM reviews rv
            LEFT JOIN users ur ON ur.id = rv.user_id
            WHERE rv.product_id=${productId}
                AND rv.deleted_at IS NULL
        `

        if (reviews.length === 0)
            return res.status(200).json([])

        const responseReviews = reviews.map(review => ({
            ...review,
            is_owner: userId ? review.clerk_id === userId : false
        }))

        // console.log(responseReviews);

        res.status(200).json(responseReviews);

    } catch (error) {
        logger.error("Error in adding review: ", error)
        res.status(500).json({
            message: process.env.NODE_ENV === 'development' ? error.message : "Internal Server Error!"
        })
    }
}

export const updateReview = async (req, res) => {
    const client = await pool.connect();
    try {
        const reviewId = req.params.id;
        const userId = req.userId || 1 //TODO: Remove this in production

        if (!reviewId)
            return res.status(404).json({ message: "No such review found" });

        if (!userId)
            return res.status(403).json({ message: "Please log in first!" });

        // Check if review exists and belongs to user
        const existingReview = await client.query(`
            SELECT user_id, product_id FROM reviews
            WHERE id = $1 AND deleted_at IS NULL
        `, [reviewId]);

        if (existingReview.rowCount === 0)
            return res.status(404).json({ message: "No such review found" });

        if (existingReview.rows[0].user_id != userId)
            return res.status(401).json({ message: "Unauthorized!" });

        const formData = {
            product_id: parseInt(req.body.product_id || existingReview.rows[0].product_id),
            rating: parseInt(req.body.rating),
            title: req.body.title || "title 1",
            body: req.body.body,
            imageUrl: req.file ? `${process.env.BACKEND_URL}/uploads/${req.file.filename}` : ""
        };

        const parsed = addReviewSchema.parse(formData);
        const {
            product_id,
            rating,
            title,
            body,
            imageUrl
        } = parsed;

        await client.query("BEGIN");

        // If new image uploaded, update images. Otherwise keep existing images
        let updatedReview;

        if (imageUrl) {
            // New image uploaded - replace existing images
            const imagesValue = JSON.stringify([{
                imageUrl,
                alt_text: "review Image of product"
            }]);
            updatedReview = await client.query(`
                UPDATE reviews 
                SET rating = $1, title = $2, body = $3, images = $4, updated_at = NOW()
                WHERE id = $5 AND user_id = $6
                RETURNING *
            `, [rating, title, body, imagesValue, reviewId, userId]);
        } else {
            // No new image, just update text fields (keep existing images)
            updatedReview = await client.query(`
                UPDATE reviews 
                SET rating = $1, title = $2, body = $3, updated_at = NOW()
                WHERE id = $4 AND user_id = $5
                RETURNING *
            `, [rating, title, body, reviewId, userId]);
        }

        if (updatedReview.rowCount === 0)
            throw new Error("Couldn't update the review!");

        await client.query("COMMIT");

        return res.status(200).json({ product_id: product_id.toString() });

    } catch (error) {
        await client.query("ROLLBACK");
        logger.error("Error in updating review: ", error);
        res.status(500).json({
            message: process.env.NODE_ENV === 'development' ? error.message : "Internal Server Error!"
        });
    } finally {
        client.release();
    }
}

export const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.userId || 1 //TODO: Remove this 1

        if (!reviewId)
            return res.status(404).json({ message: "No such review found" });

        if (!userId)
            return res.status(403).json({ message: "Please log in first!" });

        const review = await sql`
            SELECT user_id FROM reviews
            WHERE id = ${reviewId}
        `

        if (review.length === 0)
            return res.status(404).json({ message: "No such review found" });

        // logger.debug(`${typeof review[0].user_id} - ${typeof userId}`)

        if (review[0].user_id != userId)
            return res.status(401).json({ message: "Unauthorized!" });

        const deletedReview = await sql`
            DELETE FROM reviews WHERE id=${reviewId} AND user_id=${userId} RETURNING *;
        `

        if (deletedReview.length === 0)
            throw new Error("Couldn't delete the review!");

        return res.status(200).json({ success: true })
    } catch (error) {
        logger.error("Error in deleting review: ", error)
        res.status(500).json({
            message: process.env.NODE_ENV === 'development' ? error.message : "Internal Server Error!"
        })
    }
}