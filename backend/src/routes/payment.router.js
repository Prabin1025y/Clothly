import { Router } from "express";
import { sql } from "../config/db.js";
import logger from "../config/logger.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import paymentSchema from "../validation/payment.schema.js";
import CryptoJs from 'crypto-js'

const paymentRouter = Router()

const generateSignature = (total_amount, transaction_uuid, product_code) => {
    const hashString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hash = CryptoJs.HmacSHA256(hashString, process.env.ESEWA_SECRET);
    return CryptoJs.enc.Base64.stringify(hash);
}

paymentRouter.post("/generate-signature", isAuthenticated, async (req, res) => {
    try {
        const parsed = paymentSchema.parse(req.body);
        const { total_amount, transaction_uuid, product_code } = parsed;
        const userId = req.userId || 2; //TODO: remove 1 during production

        const order = await sql`SELECT total_amount FROM orders WHERE user_id = ${userId} AND status='pending' AND transaction_id=${transaction_uuid}`
        console.log(order, Number(total_amount).toFixed(2).toString())
        if (order.length == 0)
            return res.status(404).json({ success: false, message: "No such cart found." })

        if (Number(total_amount).toFixed(2).toString() !== order?.[0]?.total_amount)
            return res.status(400).json({ success: false, message: "Something went wrong on your side." })

        const hashSignature = generateSignature(total_amount, transaction_uuid, product_code);

        return res.status(201).json({ signature: hashSignature });

    } catch (error) {
        logger.error("Error while generating signature: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
})

paymentRouter.get("/payment-success/:id", async (req, res) => {
    try {
        const userId = req.userId || 1;
        const { id: transaction_uuid } = req.params

        if (!userId)
            return res.status(401).json({ message: "Unauthorized!!" });

        const order = await sql`
            SELECT id, transaction_id
            FROM orders
            WHERE user_id = ${userId} AND status='pending' AND transaction_id=${transaction_uuid}
        `

        console.log(order)
        console.log(transaction_uuid)

        if (!Array.isArray(order) || order.length === 0)
            return res.status(403).json({ message: "Unauthorized!!" });

        console.log(order[0].transaction_id !== transaction_uuid)

        if (order[0].transaction_id !== transaction_uuid)
            return res.status(403).json({ message: "Unauthorized!!" });

        await sql`
            UPDATE orders
            SET status='paid'
            WHERE id = ${order[0]?.id}
        `

        await sql`
            UPDATE carts SET type='saved' WHERE user_id=${userId} AND type='active'
        `

        res.status(200).json({ success: true });

    } catch (error) {
        logger.error("Error while marking payment succeed: ", error);
        return res.status(500).json({ message: "Internal server error" })
    }
})

paymentRouter.get("/payment-failure", async (req, res) => {
    try {
        const userId = req.userId || 2;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized!!" });

        await sql`
            DELETE FROM orders
            WHERE user_id=${userId} AND status='pending'
        `

        res.status(200).json({ success: true });

    } catch (error) {
        logger.error("Error while marking payment failed: ", error);
        return res.status(500).json({ message: "Internal server error" })
    }
})

export default paymentRouter;
