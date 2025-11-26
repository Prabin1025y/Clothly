import { Router } from "express";
import { addItemToCart, getCurrentCartItemByUserId } from "../controllers/carts.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";


const cartRouter = Router()

// cartRouter.post("/add-item-to-cart", isAuthenticated, addItemToCart)
cartRouter.post("/add-item-to-cart", addItemToCart)

// cartRouter.get("/get-cart-items", isAuthenticated, getCurrentCartItemByUserId)
cartRouter.get("/get-cart-items", getCurrentCartItemByUserId)

export default cartRouter;