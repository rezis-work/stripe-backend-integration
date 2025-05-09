import { Router } from "express";
import { stripeWebhook } from "../handlers/webhook";
import bodyParser from "body-parser";

const router = Router();

router.post(
  "/stripe",
  bodyParser.raw({ type: "application/json" }),

  stripeWebhook
);

export default router;
