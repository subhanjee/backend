// routes/planUpgradeRequestRoutes.js

const express = require("express");
const {
  requestPlanUpgrade,
  updatePlanUpgradeRequest,
  getAllPlanUpgradeRequests,
  getUserPlanUpgradeRequests,
} = require("../../controller/planUpgradeCtrl");

const router = express.Router();

router.post("/request", requestPlanUpgrade);
router.put("/:requestId", updatePlanUpgradeRequest);
router.get("/", getAllPlanUpgradeRequests);
router.get("/user-requests/:userId", getUserPlanUpgradeRequests); // Add this route


module.exports = router;
