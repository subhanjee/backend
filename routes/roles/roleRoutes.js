const express = require("express");
const router = express.Router();
const role = require("../../controller/roleCtrl");

//create a new role
router.post("/", role.createRoleCtrl);


router.post("/rolelogin", role.roleloginCtrl);

//  fetch all footers
router.get("/", role.getAllRolesCtrl);

//  single role by ID
router.get("/:id", role.getRoleByIdCtrl);

// role by ID
router.put("/:id", role.updateRoleByIdCtrl);

// delete a role by ID
router.delete("/:id", role.deleteRoleByIdCtrl);

module.exports = router; 
