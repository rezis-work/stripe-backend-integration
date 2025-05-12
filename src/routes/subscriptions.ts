import { Router } from "express";
import { getUserSubscriptions } from "../handlers/subscribtions";
import { checkAuth } from "../middlewares/checkAuth";

const router = Router();

router.get("/", checkAuth, getUserSubscriptions);

export default router;
