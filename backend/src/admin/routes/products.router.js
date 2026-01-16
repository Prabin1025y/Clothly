import { Router } from "express";
import { getAdminProducts, getProductColors, getProductSizes } from "../controllers/products.controller.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAdmin from "../../middlewares/isAdmin.js";

const adminProductsRouter = Router();

// All routes require authentication and admin role
// adminProductsRouter.use(isAuthenticated);
// adminProductsRouter.use(isAdmin);

// Get all products (paginated)
adminProductsRouter.get("/", getAdminProducts);

// Get color variants for a product
adminProductsRouter.get("/:productId/colors", getProductColors);

// Get sizes for a product and color combination
adminProductsRouter.get("/:productId/colors/:color/sizes", getProductSizes);

export default adminProductsRouter;

