const express = require("express");
const controller = require("../controller/user.controller");
const router = express.Router();
const {
    verifyToken,
    verifyOwner,
    verifyAdminOrOwner
} = require("../middleware/auth");
//get all users
router.get("/", verifyToken, verifyAdminOrOwner, controller.getAllUsers);
//register user
router.post("/register", controller.registerUser);

//login user
router.post("/login", controller.loginUser);

//update user
router.put("/:id", verifyToken, verifyOwner, controller.updateUser);

//delete user
router.delete("/:id", verifyToken, verifyOwner, controller.deleteUser);

//forget password
router.post("/send-otp", controller.sendOtp);

//reset password
router.post("/reset-password", controller.resetPassword);

module.exports = router;