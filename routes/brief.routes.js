// src/routes/brief.routes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploads");


const briefController = require("../controller/brief.controller");

// CRUD
router.post("/", upload.array("logos", 5), briefController.create);
router.get("/", briefController.list);
router.get("/:id", briefController.getById);
router.put("/:id", upload.array("logos", 5), briefController.update);
router.delete("/:id", briefController.remove);

module.exports = router;
