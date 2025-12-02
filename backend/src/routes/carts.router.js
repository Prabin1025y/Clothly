import { Router } from "express";
import { addItemToCart, deleteItemFromCart, getCartInfoFromVariantId, getCurrentCartItemByUserId } from "../controllers/carts.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";


const cartRouter = Router()

cartRouter.post("/add-item-to-cart", isAuthenticated, addItemToCart)
// cartRouter.post("/add-item-to-cart", addItemToCart)

cartRouter.get("/get-cart-items", isAuthenticated, getCurrentCartItemByUserId)
cartRouter.get("/get-cart-info-by-variant-id/:variantId", isAuthenticated, getCartInfoFromVariantId)

// cartRouter.get("/get-cart-items", getCurrentCartItemByUserId)
cartRouter.delete("/delete-cart-item/:variantId", isAuthenticated, deleteItemFromCart)

export default cartRouter;