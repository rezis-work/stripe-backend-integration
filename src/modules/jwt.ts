import jwt from "jsonwebtoken";

export const generateToken = (user: any) => {
  return jwt.sign({ user }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};
