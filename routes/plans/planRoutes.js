const express = require("express");
const router = express.Router();
const plan = require("../../controller/planCtrl");

//create a new plan
router.post("/", plan.createPlanCtrl);

//  fetch all footers
router.get("/", plan.getAllPlansCtrl);

//  single plan by ID
router.get("/:id", plan.getPlanByIdCtrl);

// plan by ID
router.put("/:id", plan.updatePlanByIdCtrl);

// delete a plan by ID
router.delete("/:id", plan.deletePlanByIdCtrl);

// get the summary 
 

module.exports = router;
