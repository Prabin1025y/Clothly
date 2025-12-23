import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { addShippingAddress, getShippingAddresses } from "../controllers/shippingAddress.controller.js";

const shippingRouter = Router()


shippingRouter.post("/add-shipping-address", addShippingAddress)

shippingRouter.get("/get-shipping-addresses", getShippingAddresses)

export default shippingRouter;