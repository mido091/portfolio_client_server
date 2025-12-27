//importation des modules

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const router = express.Router();
const db = require("./config/db");

// ============================================================================
// CORS CONFIGURATION - MUST BE BEFORE ALL ROUTES
// ============================================================================
// This configuration uses RegExp patterns to dynamically allow origins without
// requiring manual updates when deploying new frontends or using different ports.
// This fixes CORS issues with multipart/form-data (file uploads) by properly
// handling preflight OPTIONS requests from browsers.
// ============================================================================

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    // Define RegExp patterns for allowed origins (future-proof)
    const allowedPatterns = [
      /^http:\/\/localhost(:\d+)?$/, // http://localhost or http://localhost:ANY_PORT
      /^http:\/\/127\.0\.0\.1(:\d+)?$/, // http://127.0.0.1 or http://127.0.0.1:ANY_PORT
      /^https?:\/\/.*\.vercel\.app$/, // All Vercel preview & production domains
    ];

    // Optionally allow custom domain from environment variable
    if (process.env.FRONTEND_URL) {
      allowedPatterns.push(
        new RegExp(
          `^${process.env.FRONTEND_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`
        )
      );
    }

    // Check if origin matches any allowed pattern
    const isAllowed = allowedPatterns.some((pattern) => pattern.test(origin));

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests for ALL routes
// This middleware intercepts OPTIONS requests before they reach route handlers
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    // CORS headers are already set by cors middleware above
    return res.sendStatus(200);
  }
  next();
});

// Body parsing middleware
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
