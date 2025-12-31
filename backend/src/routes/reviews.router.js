import { Router } from "express";
import { addReview, getReview } from "../controllers/reviews.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";


const reviewsRouter = Router()

reviewsRouter.post("/add-review", addReview); //TODO add isauthenticatd

reviewsRouter.get("/:id", getReview);

export default reviewsRouter