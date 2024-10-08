const express = require("express");
const router = express.Router();
const {
    createProfileCtrl,
    getAllProfileCtrl,
    getProfileByIdCtrl,
    updateProfileByIdCtrl,
    deleteProfileByIdCtrl,
} = require("../../controller/profileCtrl"); // Adjust the path as necessary

// Create a new profile
router.post("/", createProfileCtrl);

// Get all profiles
router.get("/", getAllProfileCtrl);

// Get a profile by ID
router.get("/:id", getProfileByIdCtrl);

// Update a profile by ID
router.put("/:id", updateProfileByIdCtrl);

// Delete a profile by ID
router.delete("/:id", deleteProfileByIdCtrl);

module.exports = router;
