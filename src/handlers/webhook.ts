import { Request, Response } from "express";
import Stripe from "stripe";
import stripe from "../config/stripe";
import User from "../models/User";
import Purchase from "../models/Purchases";

export const stripeWebhook = async (req: Request, res: Response) => {
  const body = req.body;
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  async function handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session
  ) {
    const courseId = session.metadata?.courseId;
    const stripeCustomerId = session.customer;

    if (!courseId || !stripeCustomerId) {
      throw new Error("Missing courseId or stripeCustomerId");
    }

    const user = await User.findOne({ stripeCustomerId });

    if (!user) {
      res.status(400).send("User not found");
      return;
    }

    const purchase = await Purchase.create({
      userId: user._id,
      courseId,
      purchaseData: new Date(),
      amount: session.amount_total,
      stripePurchaseId: session.id,
    });

    if (!purchase) {
      res.status(400).send("Purchase not created");
      return;
    }

    res.status(200).send("Purchase created");
    return;
  }

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    res.status(400).send(`Webhook error: ${error}`);
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      default:
        throw new Error(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    res.status(400).send(`Webhook error: ${error}`);
    return;
  }

  res.status(200).send("Webhook received");
};
