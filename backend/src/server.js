import express from "express"
import "dotenv/config"
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { clerkMiddleware } from '@clerk/express';

import { initDB } from "./database/init.js"
import webhookRouter from "./routes/webhook.router.js"
import logger from "./config/logger.js"
import productsRouter from "./routes/products.router.js"
import reviewsRouter from "./routes/reviews.router.js"
import isAuthenticated from "./middlewares/isAuthenticated.js"
import cartRouter from "./routes/carts.router.js"
import shippingRouter from "./routes/shippingAddress.router.js"
import orderRouter from "./routes/orders.router.js"
import { bufferUpload, diskUpload } from "./config/multer.js"
import { uploadImageToCloudinary, uploadImageToDisk } from "./controllers/imageUpload.controller.js"
import paymentRouter from "./routes/payment.router.js"
import imagesRouter from "./routes/images.router.js"

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err)
})

process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason)
})

const PORT = process.env.PORT

const app = express()

app.use(express.json())
// Serve files from the "uploads" folder under the "/uploads" URL prefix
// e.g. http://localhost:PORT/uploads/<filename>
app.use("/uploads", express.static("uploads"))
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(helmet()) //Helmet is security middleware that add extra HTTP headers
app.use(morgan("dev")) //Used for logging requests
app.use(clerkMiddleware())

app.use("/api/webhooks", webhookRouter);
app.use("/api/products", productsRouter);
app.use("/api/reviews", reviewsRouter)
app.use("/api/carts", cartRouter);
app.use("/api/shipping-addresses", shippingRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/images", imagesRouter);

app.get("/", (req, res) => {
    res.send("Api working fine");
})

app.get("/api/hello", isAuthenticated, (req, res) => {
    res.json("this is sensitive")
})

app.post("/api/cloud-upload", bufferUpload.single("image"), uploadImageToCloudinary);

app.post("/api/disk-upload", diskUpload.single("image"), uploadImageToDisk);

initDB(true).then(() => {
    app.listen(PORT, () => {
        logger.info(`Server is running in port ${PORT}.`)
        // console.log(`Server is running in port ${PORT}.`);
    })
})

