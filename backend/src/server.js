import express from "express"
import "dotenv/config"
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { clerkMiddleware } from '@clerk/express';

import { initDB } from "../database/init.js"
import webhookRouter from "./routes/webhook.router.js"
import logger from "../config/logger.js"
import productsRouter from "./routes/products.router.js"

const PORT = process.env.PORT

const app = express()

app.use(express.json())
app.use(cors())
app.use(helmet()) //Helmet is security middleware that add extra HTTP headers
app.use(morgan("dev")) //Used for logging requests
app.use(clerkMiddleware())

app.use("/api/webhooks", webhookRouter);
app.use("/api/products", productsRouter);

app.get("/", (req, res) => {
    res.json("Api working fine");
})

initDB(true).then(() => {
    app.listen(PORT, () => {
        logger.info(`Server is running in port ${PORT}.`)
        // console.log(`Server is running in port ${PORT}.`);
    })
})

