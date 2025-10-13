import { getAuth, requireAuth } from "@clerk/express"
import { sql } from "../config/db.js";

const isAuthenticated = async (req, res, next) => {
    requireAuth()(req, res, async (err) => {
        if (err || res.headersSent)
            return;

        const { userId } = getAuth(req);


        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const data = await sql`
            SELECT id from users WHERE clerk_id = ${userId}
        `
        if (data.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        req.userId = data[0].id

        console.log(req.userId);
        next()
    })
}

export default isAuthenticated;