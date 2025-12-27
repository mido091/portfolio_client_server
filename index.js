//importation des modules

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const router = express.Router();
const db = require("./config/db");

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// import routes
const userRoutes = require("./routes/users");
const plogRoutes = require("./routes/plogs");
const briefRoutes = require("./routes/brief.routes");
const contactRoutes = require("./routes/contact.routes");
const settingsRoutes = require("./routes/settings.routes");

// user routes
router.use("/users", userRoutes);

// plog routes
router.use("/plogs", plogRoutes);

// brief routes
router.use("/briefs", briefRoutes);

// contact routes
router.use("/contact", contactRoutes);

// settings routes
router.use("/settings", settingsRoutes);

// Mount router with /api prefix

app.use("/api", router);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
