// src/routes/settings.routes.js
const express = require("express");
const router = express.Router();

const settingsController = require("../controller/settings.controller");

// Singleton settings
router.get("/", settingsController.get);            // GET   /api/settings
router.put("/", settingsController.replace);        // PUT   /api/settings  (replace full JSON)
router.patch("/", settingsController.patch);        // PATCH /api/settings  (merge partial)
router.post("/reset", settingsController.reset);    // POST  /api/settings/reset (optional)

module.exports = router;
