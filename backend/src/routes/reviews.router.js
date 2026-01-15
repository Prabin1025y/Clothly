import { Router } from "express";
import { addReview, deleteReview, getReview, updateReview } from "../controllers/reviews.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { diskUpload } from "../config/multer.js";


const reviewsRouter = Router()

reviewsRouter.post("/add-review", diskUpload.single("image"), addReview); //TODO add isauthenticatd

reviewsRouter.get("/:id", getReview);

reviewsRouter.put("/:id", diskUpload.single("image"), updateReview); //TODO add isauthenticatd

reviewsRouter.delete("/:id", deleteReview);

export default reviewsRouter