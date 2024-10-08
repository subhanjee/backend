const express = require("express");

const business = require("../../controller/businessCtrl");

const router = express.Router();

//////////////  
router.post("/", business.createBusinessUser);
////////////
router.get("/", business.getAllBusinessUsers);

router.get("/:id", business.getBusinessUserById);

/////////
router.put("/:id", business.updateBusinessUser);

//////////////
router.delete("/:id", business.deleteBusinessUser);

module.exports = router;
