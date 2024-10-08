const expressAsyncHandler = require("express-async-handler");
const Plan = require("../models/planModel");
const Customer = require("../models/customerModel");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const createPlanCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const plan = new Plan(req.body);
    await plan.save();
    res.status(httpStatus.CREATED).json(plan);
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

const getAllPlansCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || "_id";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;
    const plans = await Plan.find()
      .populate('Customer', '_id')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(plans);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

const getPlanByIdCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id).populate('Customer', '_id');
    if (!plan) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Plan not found"));
    }
    res.json(plan);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

const updatePlanByIdCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('Customer', '_id');
    if (!plan) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Plan not found"));
    }
    res.json(plan);
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

const deletePlanByIdCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id).populate('Customer', '_id');
    if (!plan) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Plan not found"));
    }
    res.json({ message: "Plan deleted successfully", plan });
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

module.exports = {
  createPlanCtrl,
  getAllPlansCtrl,
  getPlanByIdCtrl,
  updatePlanByIdCtrl,
  deletePlanByIdCtrl,
};
