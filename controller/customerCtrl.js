const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Customer = require("../models/customerModel");
const Plan = require("../models/planModel");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const expressAsyncHandler = require("express-async-handler");
require("dotenv").config();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = (customer, token) => {
  ///local link
  // const verificationUrl = `http://localhost:3001/logIn/token=${token}`;

  /// live link
  const verificationUrl = `https://usersoftware-itbrain.vercel.app/logIn/token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customer.email,
    subject: "Email Verification",
    html: `<p>Hi ${customer.firstName},</p>
           <p>Please verify your email by clicking the link below:</p>
           <a href="${verificationUrl}">Verify Email</a>`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending email:", err);
    } else {
      console.log("Verification email sent:", info.response);
    }
  });
};

const customerSignup = expressAsyncHandler(async (req, res, next) => {
  try {
    // Create a new local user
    const customer = new Customer(req.body);
    // Generate email verification token
    const verificationToken = customer.createEmailVerificationToken();
    // Save the user
    await customer.save();

    // Send verification email
    sendVerificationEmail(customer, verificationToken);

    res.status(httpStatus.CREATED).json({
      message:
        "User registered. Please check your email to verify your account.",
      user: customer,
    });
  } catch (error) {
    next(new ApiError(httpStatus.BAD_REQUEST, error.message));
  }
});

const customerLogin = expressAsyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });

    if (!customer || !(await bcrypt.compare(password, customer.password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    const planNames = ["Free", "Basic", "Standard", "Ultra"];
    const freePlan = await Plan.findOne({ name: { $in: planNames } }).lean();

    if (!freePlan) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "No plan found for the specified names"
      );
    }

    if (!customer.plan) {
      customer.plan = freePlan._id;
      await customer.save();
    }

    res.status(httpStatus.OK).json(customer);
  } catch (error) {
    next(
      new ApiError(
        error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        error.message
      )
    );
  }
});

const getAllCustomers = expressAsyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || "_id";
    const sortOrder = req.query.sortOrder || "asc";

    const skip = (page - 1) * limit;

    const customers = await Customer.find()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(customers);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

const updateCustomer = expressAsyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const options = { new: true };
    const customer = await Customer.findByIdAndUpdate(id, updates, options);

    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Customer user not found");
    }

    res.status(httpStatus.OK).json(customer);
  } catch (error) {
    next(
      new ApiError(
        error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        error.message
      )
    );
  }
});

const verifyEmail = expressAsyncHandler(async (req, res, next) => {
  try {
    const { token } = req.query;
    console.log("Token received:", token);

    // Hash the token to match with the stored token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log("Hashed Token:", hashedToken);

    // Find the user with the provided verification token
    const customer = await Customer.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });
    console.log("User found:", customer);

    // If no user found or token has expired, throw an error
    if (!customer) {
      console.log("Token is invalid or has expired");
      throw new ApiError(httpStatus.BAD_REQUEST, "Token is invalid or has expired");
    }

    // If email is already verified, return a success message
    if (customer.emailVerified) {
      return res.status(httpStatus.OK).json({ message: "Email is already verified" });
    }

    // Set emailVerified to true
    customer.emailVerified = true;
    console.log("Email verified status set to true");
    
    // Clear verification token and expiration date
    customer.emailVerificationToken = undefined;
    customer.emailVerificationExpires = undefined;

    await customer.save();
    console.log("User saved:", customer);

    res.status(httpStatus.OK).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error in email verification:", error);
    next(new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

const sendResetPasswordEmail = (customer, token) => {
  ////local link
  // const resetUrl = `http://localhost:3001/reset/${token}`;

  ////live link
  const resetUrl = `https://usersoftware-itbrain.vercel.app/reset/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customer.email,
    subject: "Password Reset",
    html: `<p>Hi ${customer.firstName},</p>
           <p>You requested to reset your password. Click the link below to reset it:</p>
           <a href="${resetUrl}">Reset Password</a>`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending email:", err);
    } else {
      console.log("Password reset email sent:", info.response);
    }
  });
};

const forgotPassword = expressAsyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;
    const customer = await Customer.findOne({ email });

    if (!customer) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "There is no customer with that email address."
      );
    }

    const resetToken = customer.createPasswordResetToken();
    await customer.save({ validateBeforeSave: false });

    sendResetPasswordEmail(customer, resetToken);

    res.status(httpStatus.OK).json({ message: "Token sent to email!" });
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

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

    const customer = await Customer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    console.log("User:", customer);

    if (!customer) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Token is invalid or has expired"
      );
    }

    if (password !== confirmPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Passwords do not match");
    }

    customer.password = password;
    customer.confirmPassword = confirmPassword;
    customer.passwordResetToken = undefined;
    customer.passwordResetExpires = undefined;

    // Mark password as modified to trigger pre-save middleware
    customer.markModified("password");

    await customer.save();
    console.log("Password reset successful");

    res.status(httpStatus.OK).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
});

module.exports = {
  customerSignup,
  customerLogin,
  getAllCustomers, 
  updateCustomer,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
