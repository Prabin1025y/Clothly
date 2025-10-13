import { Router } from "express";
import { addProduct } from "../controllers/products.controller.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAdmin from "../../middlewares/isAdmin.js";

const productsRouter = Router()

productsRouter.post("/add-product", isAuthenticated, isAdmin, addProduct);
// productsRouter.post("/add-product", addProduct);

export default productsRouter