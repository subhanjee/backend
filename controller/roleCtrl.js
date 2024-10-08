const expressAysncHandler = require("express-async-handler");
const Role = require("../models/rolesModel");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");

const createRoleCtrl = expressAysncHandler(async (req, res, next) => {
  try {
    const role = new Role(req.body);
    await role.save();
    res.status(httpStatus.CREATED).json(role);
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

const roleloginCtrl = expressAysncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const role = await Role.findOne({ email });

    if (!role || !(await bcrypt.compare(password, role.password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    // Assuming you want to do something meaningful with the role object after login
    // For example, you might update the last login timestamp and then save the role
    role.lastLogin = new Date();
    await role.save();

    res.status(httpStatus.OK).json(role);
  } catch (error) {
    next(
      new ApiError(
        error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        error.message
      )
    );
  }
});

const getAllRolesCtrl = expressAysncHandler(async (req, res, next) => {
  try {
    // Extract page, limit, and sort parameters from the request query or set default values
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || "_id"; // Default sorting by document ID
    const sortOrder = req.query.sortOrder || "asc"; // Default sorting order is ascending

    // Calculate the number of documents to skip based on the page number and limit
    const skip = (page - 1) * limit;

    // Fetch roles with pagination and sorting using indexes
    const roles = await Role.find()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() to retrieve plain JavaScript objects instead of Mongoose documents

    res.json(roles);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

const getRoleByIdCtrl = expressAysncHandler(async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Role not found"));
    }
    res.json(role);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

const updateRoleByIdCtrl = expressAysncHandler(async (req, res, next) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body);
    if (!role) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Role not found"));
    }
    res.json(role);
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

const deleteRoleByIdCtrl = expressAysncHandler(async (req, res, next) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Role not found"));
    }
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});
module.exports = {
  createRoleCtrl,
  getAllRolesCtrl,
  getRoleByIdCtrl,
  updateRoleByIdCtrl,
  deleteRoleByIdCtrl,
  roleloginCtrl
};
