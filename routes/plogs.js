const express = require("express");
const router = express.Router();
const plogController = require("../controller/plog.controller");
const upload = require("../middleware/uploads");
const {
    verifyToken,
    verifyOwner,
    verifyAdminOrOwner
} = require("../middleware/auth");

// create plog
router.post("/", upload.single("image"), verifyToken, verifyAdminOrOwner, plogController.createPlog);

// get all plogs
router.get("/", verifyToken, plogController.getAllPlogs);

// get plog by id
router.get("/:id", verifyToken, plogController.getPlogById);

// update plog
router.put("/:id", upload.single("image"), verifyToken, verifyAdminOrOwner, plogController.updatePlog);

// delete plog
router.delete("/:id", verifyToken, verifyAdminOrOwner, plogController.deletePlog);

module.exports = router;
