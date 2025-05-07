import Course from "../models/Courses";
import { Request, Response } from "express";
export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses" });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id);
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Error fetching course" });
  }
};
