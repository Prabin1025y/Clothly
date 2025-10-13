import { Router } from "express";
import { addProduct } from "../controllers/products.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";
import { requireAuth } from "@clerk/express";
import isAuthenticated from "../../middlewares/isAuthenticated.js";

const productsRouter = Router()

productsRouter.post("/add-product", isAuthenticated, isAdmin, addProduct);

export default productsRouter