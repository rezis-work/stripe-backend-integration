import { Router } from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
  checkUserAccess,
} from "../handlers/auth";
import validate from "../middlewares/validate";
import { registerSchema, loginSchema } from "../validators/auth";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.delete("/logout", logout);
router.get("/current-user", getCurrentUser);
router.get("/check-access/:userId", checkUserAccess);

export default router;
