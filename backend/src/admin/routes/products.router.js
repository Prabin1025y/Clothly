import { Router } from "express";
import { addProductV2, getAdminProducts, getProductColors, getProductDetail, getProductSizes } from "../controllers/products.controller.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAdmin from "../../middlewares/isAdmin.js";
import { diskUpload } from "../../config/multer.js";

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

adminProductsRouter.post("/", diskUpload.array("images", 10), addProductV2);

adminProductsRouter.get("/:slug", getProductDetail);

export default adminProductsRouter;

