import { getAuth } from "@clerk/express";
import { sql } from "../config/db.js";

export const isUserAdmin = async (req, res) => {
    try {

        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(200).json({
                isAdmin: false
            });
        }

        const [userRow] = await sql`
            SELECT role FROM users WHERE clerk_id = ${userId}
        `;

        console.log(userRow)

        if (!userRow) {
            return res.status(200).json({
                isAdmin: false
            });
        }

        if (userRow.role !== 'admin') {
            return res.status(200).json({
                isAdmin: false
            });
        }

        return res.status(200).json({
            isAdmin: true
        })

    } catch (error) {
        console.error("Error while checking if user is admin", error);
        return res.status(200).json({
            isAdmin: false
        });
    }
}