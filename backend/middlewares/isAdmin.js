import { getAuth } from "@clerk/express"
import { sql } from "../config/db.js";

const isAdmin = async (req, res, next) => {
    try {

        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const [userRow] = await sql`
            SELECT role FROM users WHERE clerk_id = ${userId}
        `;

        console.log(userRow)

        if (!userRow) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (userRow.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }

        // User is admin, proceed to next middleware/route
        next();

    } catch (error) {
        console.error("Error in isAdmin middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export default isAdmin;