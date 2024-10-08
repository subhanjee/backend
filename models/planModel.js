const mongoose = require("mongoose");

const planSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    adminAccount: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    cashierAccount: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    orders: {
      type: String,
      required: true,
    },
    salesman: {
      type: String,
      required: true,
    },
    chatSupport: {
      type: String,
      required: true,
    },
    fbrIntegration: {
      type: String,
      required: true,
    },
    extraTerminal: {
      type: String,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model("Plan", planSchema);

module.exports = Plan;
