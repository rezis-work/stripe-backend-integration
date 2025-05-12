import { Router } from "express";
import {
  createCheckoutSession,
  createProPlanCheckoutSession,
} from "../handlers/stripe";
import { checkAuth } from "../middlewares/checkAuth";
const router = Router();

router.post(
  "/create-checkout-session/:courseId",
  checkAuth,
  createCheckoutSession
);

router.post(
  "/create-pro-plan-checkout-session/:planId",
  checkAuth,
  createProPlanCheckoutSession
);

export default router;
