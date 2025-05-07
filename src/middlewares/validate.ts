import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";

const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  };

export default validate;
