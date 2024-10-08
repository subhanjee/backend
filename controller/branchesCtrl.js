const expressAsyncHandler = require("express-async-handler");
const Branch = require("../models/branchesModel");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const createBranchCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const branch = new Branch(req.body);
    await branch.save();
    res.status(httpStatus.CREATED).json(branch);
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

const getAllBranchesCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || "_id";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;
    const branches = await Branch.find()
      .populate('user', '_id')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(branches);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

const getBranchByIdCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id).populate('user', '_id');
    if (!branch) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Branch not found"));
    }
    res.json(branch);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

const updateBranchByIdCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user', '_id');
    if (!branch) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Branch not found"));
    }
    res.json(branch);
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

const deleteBranchByIdCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id).populate('user', '_id');
    if (!branch) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Branch not found"));
    }
    res.json({ message: "Branch deleted successfully", branch });
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

module.exports = {
  createBranchCtrl,
  getAllBranchesCtrl,
  getBranchByIdCtrl,
  updateBranchByIdCtrl,
  deleteBranchByIdCtrl,
};
