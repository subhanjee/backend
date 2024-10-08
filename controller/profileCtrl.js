const expressAsyncHandler = require("express-async-handler");
const ProfilePage = require("../models/profileModel");
 const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const createProfileCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const profile = new ProfilePage(req.body);
    await profile.save();
    res.status(httpStatus.CREATED).json(profile);
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

const getAllProfileCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || "_id";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;
    const profiles = await ProfilePage.find()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(profiles);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

const getProfileByIdCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const profile = await ProfilePage.findById(req.params.id)
    if (!profile) {
      return next(new ApiError(httpStatus.NOT_FOUND, "ProfilePage not found"));
    }
    res.json(profile);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

const updateProfileByIdCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const profile = await ProfilePage.findByIdAndUpdate(req.params.id, req.body, { new: true }) 
    if (!profile) {
      return next(new ApiError(httpStatus.NOT_FOUND, "ProfilePage not found"));
    }
    res.json(profile);
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

const deleteProfileByIdCtrl = expressAsyncHandler(async (req, res, next) => {
  try {
    const profile = await ProfilePage.findByIdAndDelete(req.params.id) 
    if (!profile) {
      return next(new ApiError(httpStatus.NOT_FOUND, "ProfilePage not found"));
    }
    res.json({ message: "ProfilePage deleted successfully", profile });
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

module.exports = {
  createProfileCtrl,
  getAllProfileCtrl,
  getProfileByIdCtrl,
  updateProfileByIdCtrl,
  deleteProfileByIdCtrl,
};
