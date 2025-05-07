import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    stripeCustomerId: {
      type: String,
      required: false,
    },
    currentSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ stripeCustomerId: 1 }, { unique: true, sparse: true });
userSchema.index({ currentSubscriptionId: 1 }, { sparse: true });

const User = mongoose.model("User", userSchema);

export default User;
