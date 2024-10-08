const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const User = require("../models/userModel");

const verifySession = async (req, res, next) => {
  const sessionToken = req.headers.authorization?.split(" ")[1];

  if (!sessionToken) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "No session token provided"));
  }

  const user = await User.findOne({ sessionToken });

  if (!user) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid session token"));
  }

  req.user = user;
  next();
};

module.exports = verifySession;
