const express = require("express");
const {
  verifyEmail,
  forgotPassword,
  resetPassword,
  getAllCustomers,
  updateCustomer,
  customerLogin,
  customerSignup
} = require("../../controller/customerCtrl");

const router = express.Router();

// POST route for user login
router.post("/customerLogin", customerLogin);
 
// POST route for user signup
router.post("/customerSignup", customerSignup);

// GET route to retrieve all users
router.get("/allCustomer", getAllCustomers);

// PUT route to update a user
router.put("/allCustomers/:id", updateCustomer);

// GET route to verify a user
router.get("/verify-email", verifyEmail);

///// post  fotgort
router.post('/forgotPassword', forgotPassword);

// post resetPassword
router.post('/resetPassword/:token', resetPassword);

module.exports = router;
 