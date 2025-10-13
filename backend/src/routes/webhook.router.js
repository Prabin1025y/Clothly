import express, { Router } from "express";
import { verifyWebhook } from "@clerk/express/webhooks"
import { sql } from "../../config/db.js";
import logger from "../../config/logger.js";


const webhookRouter = Router()

webhookRouter.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const evt = await verifyWebhook(req)

        switch (evt.type) {
            case "user.created":
                const user = evt.data;
                const fullName = `${user.first_name} ${user.last_name}`
                const imageUrl = user.image_url
                const email = user.email_addresses[0].email_address
                const clerkId = user.id
                const isVerified = user.email_addresses[0].verification.status == "verified"
                const isAdmin = email === process.env.ADMIN_EMAIL

                const creadted_user = await sql`
                    INSERT INTO users (clerk_id, image_url, email, full_name, is_verified, role)
                    VALUES (${clerkId}, ${imageUrl}, ${email}, ${fullName}, ${isVerified}, ${isAdmin ? "admin" : "customer"})
                    ON CONFLICT (clerk_id) DO NOTHING
                    RETURNING *;
                `
                logger.info(`User Created with email ${email}`)
                return res.status(201).json({ success: true, message: "User Created" })

            case "user.updated":
                const user_updated = evt.data;
                const fullName_updated = `${user_updated.first_name} ${user_updated.last_name}`
                const imageUrl_updated = user_updated.image_url
                const isVerified_updated = user_updated.email_addresses[0].verification.status == "verified"

                await sql`
                    UPDATE users
                    SET
                        full_name = ${fullName_updated},
                        image_url = ${imageUrl_updated},
                        is_verified = ${isVerified_updated}
                    WHERE clerk_id = ${user_updated.id};
                `
                logger.info(`User updated with email ${user_updated.email_addresses[0].email_address}`)
                return res.status(201).json({ success: true, message: "User Updated" })

            case "user.deleted":
                const userClerkId = evt.data.id
                if (evt.data.deleted) {
                    const deleted_user = await sql`
                        UPDATE users
                        SET deleted_at = ${new Date()}
                        WHERE clerk_id = ${userClerkId}
                        RETURNING *;
                    `

                    logger.info("User deleted ")
                    console.log(deleted_user[0])
                }

                return res.status(200).json({ success: true, message: "User Deleted" })

            case "session.created":
                const clerkIdSessionCreated = evt.data.user_id
                await sql`
                    UPDATE users
                    SET last_login_at=${new Date()}
                    WHERE clerk_id = ${clerkIdSessionCreated};
                `
                logger.info("User logged in!!");
                return res.status(200).json({ success: true, message: "User Logged In" })
            default:
                break;
        }

        return res.send('Webhook received')
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return res.status(400).send('Error verifying webhook')
    }
})

export default webhookRouter;