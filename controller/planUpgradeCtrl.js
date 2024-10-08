 const PlanUpgradeRequest = require("../models/planUpgrade");
const Customer = require("../models/customerModel");
const Plan = require("../models/planModel");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const expressAsyncHandler = require("express-async-handler");

// User requests for a plan upgrade
const requestPlanUpgrade = expressAsyncHandler(async (req, res, next) => {
  try {
    const { userId, requestedPlanId } = req.body;

    // Validate user and requested plan
    const user = await Customer.findById(userId);
    const requestedPlan = await Plan.findById(requestedPlanId);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    if (!requestedPlan) {
      throw new ApiError(httpStatus.NOT_FOUND, "Requested plan not found");
    }

    // Create a new plan upgrade request
    const planUpgradeRequest = new PlanUpgradeRequest({
      user: userId,
      requestedPlan: requestedPlanId,
    });
    await planUpgradeRequest.save();

    res.status(httpStatus.CREATED).json(planUpgradeRequest);
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

// Admin approves a plan upgrade reqauest
const updatePlanUpgradeRequest = expressAsyncHandler(async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { action, rejectionReason } = req.body; // Include rejectionReason in the body

    const planUpgradeRequest = await PlanUpgradeRequest.findById(requestId).populate('user requestedPlan');
    if (!planUpgradeRequest) {
      throw new ApiError(httpStatus.NOT_FOUND, "Plan upgrade request not found");
    }

    let responseMessage;
    
    if (action === "approve") {
      // Approve the plan upgrade request
      planUpgradeRequest.status = "Approved";
      planUpgradeRequest.responseDate = new Date();
      await planUpgradeRequest.save();

      // Update the user's plan
      const user = await Customer.findById(planUpgradeRequest.user._id);
      user.plan = planUpgradeRequest.requestedPlan._id;
      await user.save(); 

      responseMessage = "Plan upgrade approved successfully.";
    } else if (action === "reject") {
      // Reject the plan upgrade request and save the rejection reason
      if (!rejectionReason) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Rejection reason is required");
      }
      planUpgradeRequest.status = "Rejected";
      planUpgradeRequest.responseDate = new Date();
      planUpgradeRequest.rejectionReason = rejectionReason; // Save the rejection reason
      await planUpgradeRequest.save();

      responseMessage = `Plan upgrade rejected: ${rejectionReason}`;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid action");
    }

    res.status(httpStatus.OK).json({
      planUpgradeRequest,
      message: responseMessage,
    });
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

// Admin gets all plan upgrade requests
const getAllPlanUpgradeRequests = expressAsyncHandler(async (req, res, next) => {
  try {
    const requests = await PlanUpgradeRequest.find()
      .populate("user", "email firstName lastName")
      .populate("requestedPlan", "name price")
      .lean();

    res.status(httpStatus.OK).json(requests);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});
const getUserPlanUpgradeRequests = expressAsyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.params;

    const requests = await PlanUpgradeRequest.find({ user: userId })
    .populate("user", "email firstName lastName")
    .populate("requestedPlan", "name price")
    .lean();

    res.status(httpStatus.OK).json(requests);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

module.exports = {
  requestPlanUpgrade,
  updatePlanUpgradeRequest,
  getAllPlanUpgradeRequests,
  getUserPlanUpgradeRequests
};
