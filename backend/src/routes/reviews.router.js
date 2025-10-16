import { Router } from "express";
import { addReview } from "../controllers/reviews.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";


const reviewsRouter = Router()

reviewsRouter.post("/add-review", isAuthenticated, addReview);

export default reviewsRouter