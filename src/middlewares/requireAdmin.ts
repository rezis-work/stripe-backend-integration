import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  user: {
    _id: string;
    email: string;
    role: string;
  };
}

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (!decoded || decoded.user.role !== "admin") {
      res.status(403).json({
        message: "Forbidden",
      });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
};
