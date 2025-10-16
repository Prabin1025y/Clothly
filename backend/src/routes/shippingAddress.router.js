import { Router } from "express";
import shippingAddressSchema from "../validation/shipping.schema.js";
import logger from "../config/logger.js";
import { sql } from "../config/db.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const shippingRouter = Router()


shippingRouter.post("/add-shipping-address", isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId || 1;//TODO: remove 1 in production

        const parsed = shippingAddressSchema.parse(req.body)

        const {
            label,
            recipient_name,
            district,
            province,
            city,
            tole_name,
            postal_code,
            phone,
            is_default
        } = parsed

        //TODO: Calculate base shipping cost based on distance
        const baseShippingCost = 100;

        const inserted_dataa = await sql`
            INSERT INTO shipping_addresses (
                user_id,
                label,
                recipient_name,
                district,
                province,
                city,
                tole_name,
                postal_code,
                phone,
                is_default,
                base_shipping_cost
            )
            VALUES (
                ${userId},
                ${label},
                ${recipient_name},
                ${district},
                ${province},
                ${city},
                ${tole_name},
                ${postal_code},
                ${phone},
                ${is_default},
                ${baseShippingCost}
            )
            RETURNING *
        `

        return res.status(201).json({ success: true, data: inserted_dataa[0] })


    } catch (error) {
        logger.error("Error while creating an order: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
})

export default shippingRouter;