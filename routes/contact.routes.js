// src/routes/contact.routes.js
const express = require("express");
const router = express.Router();

const contactController = require("../controller/contact.controller");

// CRUD
router.post("/", contactController.create);     // POST   /api/contact
router.get("/", contactController.list);        // GET    /api/contact
router.get("/:id", contactController.getById);  // GET    /api/contact/:id
router.put("/:id", contactController.update);   // PUT    /api/contact/:id
router.delete("/:id", contactController.remove);// DELETE /api/contact/:id

module.exports = router;
