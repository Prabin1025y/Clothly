import { Router } from "express";
import { addItemToCart } from "../controllers/carts.controller.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";


const cartRouter = Router()

cartRouter.post("/add-item-to-cart", isAuthenticated, addItemToCart)
// cartRouter.post("/add-item-to-cart", addItemToCart)

export default cartRouter;