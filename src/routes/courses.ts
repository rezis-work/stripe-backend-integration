import { Router } from "express";
import { getCourses, getCourseById } from "../handlers/courses";

const router = Router();

router.get("/", getCourses);
router.get("/:id", getCourseById);

export default router;
