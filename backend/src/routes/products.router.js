import { Router } from "express";
import { addProduct, getProductBySlug, getProducts, getRecentProducts } from "../controllers/products.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";

const productsRouter = Router()

// productsRouter.post("/add-product", isAuthenticated, isAdmin, addProduct);

productsRouter.get("/get-products", getProducts);

productsRouter.get("/get-recent-products", getRecentProducts);

productsRouter.get("/get-product/:slug", getProductBySlug);

productsRouter.post("/add-product", addProduct);

export default productsRouter