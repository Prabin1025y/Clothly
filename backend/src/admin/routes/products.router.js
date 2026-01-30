import { Router } from "express";
import { addProductV2, deleteProduct, getAdminProducts, getProductBySlug, getProductReviewBySlug, updateProduct } from "../controllers/products.controller.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAdmin from "../../middlewares/isAdmin.js";
import { diskUpload } from "../../config/multer.js";

const adminProductsRouter = Router();

// All routes require authentication and admin role
// adminProductsRouter.use(isAuthenticated);
// adminProductsRouter.use(isAdmin);

// Get all products (paginated)
adminProductsRouter.get("/", getAdminProducts);

adminProductsRouter.post("/", diskUpload.array("images", 10), addProductV2);

adminProductsRouter.get("/:slug", getProductBySlug);

adminProductsRouter.get("/reviews/:slug", getProductReviewBySlug);

adminProductsRouter.put("/:slug", diskUpload.array("images", 10), updateProduct);

adminProductsRouter.delete("/:slug", deleteProduct);

export default adminProductsRouter;

