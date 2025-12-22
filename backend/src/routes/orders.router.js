import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { cancelOrder, createOrder, getOrderItems, getOrderItemsByTransactionId } from "../controllers/orders.controller.js";

const orderRouter = Router()

orderRouter.post("/create-order", isAuthenticated, createOrder);

orderRouter.get("/order-items", getOrderItems);
orderRouter.get("/order-items/:id", getOrderItemsByTransactionId);
orderRouter.delete("/cancel-order/:id", cancelOrder);

export default orderRouter;
