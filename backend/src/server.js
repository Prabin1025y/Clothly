import express from "express"
import "dotenv/config"
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { initDB } from "../database/init.js"

const PORT = process.env.PORT

const app = express()

app.use(express.json())
app.use(cors())
app.use(helmet()) //Helmet is security middleware that add extra HTTP headers
app.use(morgan("dev")) //Used for logging requests

app.get("/", (req, res) => {
    res.json("Api working fine");
})

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running in port ${PORT}.`);
    })
})

