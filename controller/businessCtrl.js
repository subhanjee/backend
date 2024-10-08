const expressAsyncHandler = require("express-async-handler");
const BusinessUser = require("../models/businessModel");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const createBusinessUser = expressAsyncHandler(async (req, res, next) => {
  try {
    const businessUser = new BusinessUser(req.body);
    await businessUser.save();
    res.status(httpStatus.CREATED).json(businessUser);
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

const getAllBusinessUsers = expressAsyncHandler(async (req, res, next) => {
  try {
    // Extract page, limit, and sort parameters from the request query or set default values
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || "_id"; // Default sorting by document ID
    const sortOrder = req.query.sortOrder || "asc"; // Default sorting order is ascending

    // Calculate the number of documents to skip based on the page number and limit
    const skip = (page - 1) * limit;

    // Fetch business users with pagination and sorting using indexes
    const businessUsers = await BusinessUser.find()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() to retrieve plain JavaScript objects instead of Mongoose documents

    res.json(businessUsers);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

const getBusinessUserById = expressAsyncHandler(async (req, res, next) => {
  try {
    const businessUser = await BusinessUser.findById(req.params.id);
    if (!businessUser) {
      return next(new ApiError(httpStatus.NOT_FOUND, "BusinessUser not found"));
    }
    res.json(businessUser);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

const updateBusinessUser = expressAsyncHandler(async (req, res, next) => {
  try {
    const businessUser = await BusinessUser.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!businessUser) {
      return next(new ApiError(httpStatus.NOT_FOUND, "BusinessUser not found"));
    }
    res.json(businessUser);
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

const deleteBusinessUser = expressAsyncHandler(async (req, res, next) => {
  try {
    const businessUser = await BusinessUser.findByIdAndDelete(req.params.id);
    if (!businessUser) {
      return next(new ApiError(httpStatus.NOT_FOUND, "BusinessUser not found"));
    }
    res.json({ message: "BusinessUser deleted successfully" });
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

module.exports = {
  createBusinessUser,
  getAllBusinessUsers,
  getBusinessUserById,
  updateBusinessUser,
  deleteBusinessUser,
};
