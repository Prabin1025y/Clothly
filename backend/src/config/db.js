import { Pool, neon } from "@neondatabase/serverless"
import dotenv from 'dotenv'
dotenv.config()

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require&channel_binding=require`

export const pool = new Pool({
    connectionString: connectionString,
});

export const sql = neon(connectionString);
