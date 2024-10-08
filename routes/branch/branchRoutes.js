const express = require("express");
const router = express.Router();
const branch = require("../../controller/branchesCtrl");

//create a new branch
router.post("/", branch.createBranchCtrl);

//  fetch all footers
router.get("/", branch.getAllBranchesCtrl);

//  single branch by ID
router.get("/:id", branch.getBranchByIdCtrl);

// branch by ID
router.put("/:id", branch.updateBranchByIdCtrl);

// delete a branch by ID
router.delete("/:id", branch.deleteBranchByIdCtrl);

// get the summary 
 

module.exports = router;
