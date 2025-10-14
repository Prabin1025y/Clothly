import { Router } from "express";
import { addProduct, getProductBySlug, getProducts } from "../controllers/products.controller.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAdmin from "../../middlewares/isAdmin.js";

const productsRouter = Router()

// productsRouter.post("/add-product", isAuthenticated, isAdmin, addProduct);
productsRouter.get("/get-products", getProducts)

productsRouter.post("/add-product", addProduct);

productsRouter.get("/get-product/:slug", getProductBySlug);

export default productsRouter