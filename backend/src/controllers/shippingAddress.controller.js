import logger from "../config/logger.js";
import { pool, sql } from "../config/db.js";
import { shippingAddressSchema } from "../validation/shipping.schema.js";
import { success } from "zod";

export const addShippingAddress = async (req, res) => {
    try {
        const userId = req.userId || 1;//TODO: remove 1 in production

        if (!userId)
            return res.status(401).json({ message: "Unauthorized!" })

        const parsed = shippingAddressSchema.parse(req.body)

        const {
            label,
            recipient_name,
            district,
            province,
            city,
            tole_name,
            postal_code,
            phone
        } = parsed

        //TODO: Calculate base shipping cost based on distance
        const baseShippingCost = 100;

        const shipping_addresses = await sql`
            SELECT id FROM shipping_addresses WHERE user_id = ${userId} LIMIT 1
        `

        let isDefault = false;
        if (shipping_addresses.length === 0)
            isDefault = true;

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
                ${isDefault},
                ${baseShippingCost}
            )
            RETURNING 
                id, 
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
        `
        console.log(inserted_dataa);

        return res.status(201).json({ success: true, data: inserted_dataa[0] })


    } catch (error) {
        logger.error("Error while creating a shipping address: ", error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getShippingAddresses = async (req, res) => {
    try {
        const userId = req.userId || 1;//TODO: remove 2 in production

        if (!userId)
            return res.status(401).json({ message: "Unauthenticated!!" });

        const shippingAddresses = await sql`
            SELECT
                id, 
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
            FROM shipping_addresses si
            WHERE si.user_id = ${userId}
        `

        return res.status(201).json({ success: true, data: shippingAddresses })


    } catch (error) {
        logger.error("Error while getting shipping addresses: ", error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const deleteShippingAddress = async (req, res) => {
    try {
        const userId = req.userId || 1;//TODO: remove 1 in production
        if (!userId)
            return res.status(401).json({ message: "Unauthorized!" })

        const shippingAddressId = Number(req.params.id);
        if (!Number.isInteger(shippingAddressId))
            return res.status(404).json({ message: "No such shipping address found!" })

        const deletedShippingAddress = await sql`
            DELETE FROM shipping_addresses
            WHERE id=${shippingAddressId} AND user_id=${userId}
            RETURNING id, is_default
        `

        if (deletedShippingAddress.length === 0)
            return res.status(404).json({ message: "No such shipping address found!" })

        //Set another address as default if deleted address was default
        if (deletedShippingAddress[0].is_default) {
            await sql`
                UPDATE shipping_addresses
                SET is_default = TRUE
                WHERE id = (
                    SELECT id FROM shipping_addresses
                    WHERE user_id=${userId}
                    ORDER BY created_at ASC
                    LIMIT 1
                )
            `;
        }

        res.status(200).json({ success: true });
    } catch (error) {
        logger.error("Error while deleting a shipping Address: ", error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const makeShippingAddressDefault = async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.userId || 1;//TODO: remove 1 in production
        if (!userId)
            return res.status(401).json({ message: "Unauthorized!" })

        const shippingAddressId = Number(req.params.id);
        if (!shippingAddressId || !Number.isInteger(shippingAddressId))
            return res.status(404).json({ message: "No such shipping address found!" })

        const addressCheck = await client.query(`
                SELECT is_default 
                FROM shipping_addresses
                WHERE id=$1 AND user_id=$2
            `, [shippingAddressId, userId]);

        if (addressCheck.rowCount === 0)
            return res.status(404).json({ message: "No such shipping address found!" })

        //the given shipping address is already default.
        if (addressCheck.rows[0].is_default)
            return res.status(200).json({ success: true });

        await client.query("BEGIN");

        //Unset any existing default address
        await client.query(`
                UPDATE shipping_addresses
                SET is_default = FALSE
                WHERE user_id=$1 AND is_default=TRUE
            `, [userId]);

        //Set new address default
        await client.query(`
                UPDATE shipping_addresses
                SET is_default = TRUE 
                WHERE id=$1 AND user_id=$2
            `, [shippingAddressId, userId])

        await client.query("COMMIT");

        return res.status(200).json({ success: true });
    } catch (error) {
        client.query("ROLLBACK");
        logger.error("Error while making a shipping Address as default: ", error);
        return res.status(500).json({ message: "Internal server error" })
    } finally {
        client.release();
    }
}