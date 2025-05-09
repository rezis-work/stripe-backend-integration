import { Router } from "express";
import { createCheckoutSession } from "../handlers/stripe";
import { checkAuth } from "../middlewares/checkAuth";
const router = Router();

router.post(
  "/create-checkout-session/:courseId",
  checkAuth,
  createCheckoutSession
);

export default router;
