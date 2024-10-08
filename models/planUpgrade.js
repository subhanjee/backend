
const mongoose = require("mongoose");

const planUpgradeRequestSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    requestedPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    responseDate: Date,
    rejectionReason: String, // New field added here

  },
  {
    timestamps: true,
  }
);

const PlanUpgradeRequest = mongoose.model(
  "PlanUpgradeRequest",
  planUpgradeRequestSchema
);

module.exports = PlanUpgradeRequest;
