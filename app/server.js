"use strict";

const { static: _static } = require("express");
const { join } = require("path");
const config = require("./common/config");
const logger = require("./common/logger");
const Sentry = require("./connections/sentry");
const { FDKExtension } = require("./fdk");
const v1Router = require("./routes/v1.router");
const { errorHandler } = require("./middlewares/error.middleware");
const Server = require("fit/server");

// fit/server's Router wraps Express Router and is passed to Server.init()
// Server.init() automatically adds: cookie-parser (using COOKIE_SECRET env),
// body-parser json (2mb limit), and request logging middleware
const router = Server.Router();

// Allow the Fynd console to embed this extension inside an iframe.
// Without frame-ancestors *, fit/server's default CSP blocks cross-origin framing
// and the Fynd console shows "refused to connect".
router.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "frame-ancestors *");
  next();
});

// Serve /env.js — browser reads this at runtime to get config values
// Pattern from promo-tagger: exposes HOST_MAIN_URL so frontend can build API URLs
router.get("/env.js", (req, res) => {
  res.type("application/javascript");
  res.send(
    `window.env = ${JSON.stringify(
      {
        HOST_MAIN_URL: config.BROWSER_CONFIG.HOST_MAIN_URL,
        env: config.env,
      },
      null,
      2
    )}`
  );
});

// Serve frontend build output (Vite builds to frontend/public/dist)
router.use(_static(join(__dirname, "../frontend/public/dist"), { index: false }));

// FDK handler MUST be registered before API routes
// It handles: OAuth callback, session middleware, platformClient injection
router.use("/", FDKExtension.fdkHandler);

// Webhook endpoint — processes events registered in app/webhook/event-map.js
router.post("/api/webhook-events", async (req, res) => {
  try {
    logger.info("Webhook received", { event: req.body?.event });
    await FDKExtension.webhookRegistry.processWebhook(req);
    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error("Webhook processing error", { event: req.body?.event, err });
    return res.status(500).json({ success: false });
  }
});

// Mount v1 routes under FDK's apiRoutes — this adds auth middleware + platformClient
const apiRoutes = FDKExtension.apiRoutes;
apiRoutes.use("/v1", v1Router);
router.use("/api", apiRoutes);

// Optional: application-proxy routes (needed for app-scoped APIs with applicationClient)
// const appProxyRoutes = FDKExtension.applicationProxyRoutes;
// appProxyRoutes.use("/v1", appV1Router);
// router.use("/application", appProxyRoutes);

// Sentry error handler must come before the custom errorHandler
router.use(Sentry.Handlers.errorHandler());

// Global error handler
router.use(errorHandler);

// SPA fallback — all unmatched routes serve index.html
router.get("*", (req, res) => {
  res.contentType("text/html");
  res.sendFile(join(__dirname, "../frontend/public/dist", "index.html"));
});

// Server.init wires middleware; Server.start() begins listening on process.env.PORT
Server.init({ server: router }, [], []);
Server.start();

module.exports = router;
