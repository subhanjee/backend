const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const expressAsyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

//// Controller function to register a new user
const signup = expressAsyncHandler(async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(httpStatus.CREATED).json(user);
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

//// user login
const login = expressAsyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    // Invalidate any existing session token
    user.sessionToken = undefined;
    await user.save();

    // Generate a new session token
    const sessionToken = crypto.randomBytes(20).toString("hex");
    user.sessionToken = sessionToken;
    user.lastLogin = new Date();
    await user.save();

    res.status(httpStatus.OK).json({ user, sessionToken });
  } catch (error) {
    next(
      new ApiError(
        error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        error.message
      )
    );
  }
});

const logout = expressAsyncHandler(async (req, res, next) => {
  try {
    const { user } = req;

    user.sessionToken = undefined;
    await user.save();

    res.status(httpStatus.OK).json({ message: "Logout successful" });
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

//// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//// sendResetPasswordMail
const sendResetPasswordEmail = (user, token, authorizedEmail) => {
  /////local link

  const resetUrl = `http://localhost:5173/auth/resetPassword/${token}`;

  // live link

  // const resetUrl = `ismart2admin-itbrain.vercel.app/resetPassword/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: authorizedEmail,
    subject: "Password Reset Request for User",
    html: `<p>Hi Admin,</p>
           <p>The user <strong>${user.userName}</strong> has requested to reset their password. Click the link below to reset it:</p>
           <a href="${resetUrl}">Reset Password for ${user.userName}</a>`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending email:", err);
    } else {
      console.log("Password reset email sent to admin:", info.response);
    }
  });
};

//// forgotPassword
const forgotPassword = expressAsyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "There is no user with that email address."
      );
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Replace with the authorized email
    const authorizedEmail = process.env.EMAIL_USER;

    sendResetPasswordEmail(user, resetToken, authorizedEmail);

    res.status(httpStatus.OK).json({ message: "Token sent to admin's email!" });
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

/////resetPassword
const resetPassword = expressAsyncHandler(async (req, res, next) => {
  try {
    console.log("Reset password request received");

    const { token } = req.params;
    console.log("Token:", token);

    const { password, confirmPassword } = req.body;
    console.log("New Password:", password);
    console.log("Confirm Password:", confirmPassword);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log("Hashed Token:", hashedToken);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    console.log("User:", user);

    if (!user) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Token is invalid or has expired"
      );
    }

    if (password !== confirmPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Passwords do not match");
    }

    user.password = password;
    user.confirmPassword = confirmPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Mark password as modified to trigger pre-save middleware
    user.markModified("password");

    await user.save();
    console.log("Password reset successful");

    res.status(httpStatus.OK).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

module.exports = { login, forgotPassword, resetPassword, signup, logout };
