import { Request, Response } from "express";
import Stripe from "stripe";
import stripe from "../config/stripe";
import User from "../models/User";
import Purchase from "../models/Purchases";
import Subscription from "../models/Subscriptions";

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

  async function handleSubscriptionUpsert(
    subscription: Stripe.Subscription,
    eventType: string
  ) {
    const stripeCustomerId = subscription.customer as string;
    const user = await User.findOne({ stripeCustomerId });

    if (!user) {
      throw new Error(
        `User not found for stripeCustomerId: ${stripeCustomerId}`
      );
    }

    try {
      const subscriptionDoc = await Subscription.findOneAndUpdate(
        {
          userId: user._id,
          stripeSubscriptionId: subscription.id,
        },
        {
          $set: {
            status: subscription.status,
            planType: subscription.items.data[0].plan.interval as
              | "month"
              | "year",
            currentPeriodStart: subscription.trial_start,
            currentPeriodEnd: subscription.trial_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        },
        { upsert: true, new: true }
      );
      console.log(
        `Subscription upserted for user: ${user._id} ${eventType} for subscription ${subscription.id}`
      );

      await User.findByIdAndUpdate(user._id, {
        $set: {
          currentSubscriptionId: subscriptionDoc._id,
        },
      });
    } catch (error) {
      console.error(
        `Error processing subscription ${eventType} for subscription ${subscription.id}`,
        error
      );
    }
  }

  async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      const subscriptionDoc = await Subscription.findOne({
        stripeSubscriptionId: subscription.id,
      });

      if (!subscriptionDoc) {
        throw new Error(
          `Subscription not found for stripeSubscriptionId: ${subscription.id}`
        );
      }

      const user = await User.findById(subscriptionDoc.userId);

      if (!user) {
        throw new Error(`User not found for subscription ${subscription.id}`);
      }

      await User.findByIdAndUpdate(user._id, {
        $set: {
          currentSubscriptionId: null,
        },
      });

      await Subscription.findByIdAndDelete(subscriptionDoc._id);

      res.status(200).send("Successfully deleted subscription");
    } catch (error) {
      console.error(`Error deleting subscription ${subscription.id}`, error);
      res.status(500).send("Error deleting subscription");
    }
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

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpsert(
          event.data.object as Stripe.Subscription,
          event.type
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
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
