import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "../modules/jwt";
import jwt, { JwtPayload } from "jsonwebtoken";
import stripe from "../config/stripe";
import Subscription from "../models/Subscriptions";
import Purchase from "../models/Purchases";
export const register = async (req: Request, res: Response) => {
  const { name, email, password, stripeCustomerId = null } = req.body;
  console.log(name, email, password);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        message: "User already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      stripeCustomerId,
    });

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const customerStripe = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString(),
      },
    });

    await User.findByIdAndUpdate(user._id, {
      stripeCustomerId: customerStripe.id,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        message: "Invalid credentials",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid credentials",
      });
      return;
    }

    const token = generateToken(user._id.toString());
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Logout successful",
  });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.user);
    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        stripeCustomerId: user.stripeCustomerId,
        currentSubscriptionId: user.currentSubscriptionId || null,
      },
    });
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        stripeCustomerId: user.stripeCustomerId,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

export const getUserByStripeCustomerId = async (
  req: Request,
  res: Response
) => {
  const { stripeCustomerId } = req.params;

  try {
    const user = await User.findOne({ stripeCustomerId });
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        stripeCustomerId: user.stripeCustomerId,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

export const checkUserAccess = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const courseId = req.query.courseId as string;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    let hasAccess = false;
    // Check if user has an active subscription
    if (user.currentSubscriptionId) {
      const subscription = await Subscription.findById(
        user.currentSubscriptionId
      );
      if (subscription && subscription.status === "active") {
        hasAccess = true;
      }

      res.status(200).json({
        hasAccess,
        accessType: "subscription",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
      return;
    }

    const purchase = await Purchase.findOne({
      userId: user._id,
      courseId: courseId,
    });

    if (purchase) {
      res.status(200).json({
        hasAccess: true,
        accessType: "course",
      });
      return;
    }

    res.status(200).json({
      hasAccess: false,
      accessType: "none",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};
