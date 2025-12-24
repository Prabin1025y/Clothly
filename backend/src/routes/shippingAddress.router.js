import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { addShippingAddress, deleteShippingAddress, getShippingAddresses, makeShippingAddressDefault } from "../controllers/shippingAddress.controller.js";

const shippingRouter = Router()


shippingRouter.post("/add-shipping-address", addShippingAddress);

shippingRouter.get("/get-shipping-addresses", getShippingAddresses);

shippingRouter.delete("/delete-shipping-address/:id", deleteShippingAddress);

shippingRouter.patch("/make-default/:id", makeShippingAddressDefault);

export default shippingRouter;