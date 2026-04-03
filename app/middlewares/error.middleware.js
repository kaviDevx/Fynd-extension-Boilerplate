"use strict";

const logger = require("../common/logger");

/**
 * Global Express error handler.
 * Must be registered as the LAST middleware in server.js.
 * Express identifies error handlers by the 4-argument signature (err, req, res, next).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error("Request error", {
    status,
    message,
    path: req.path,
    method: req.method,
    stack: status >= 500 ? err.stack : undefined,
  });

  return res.status(status).json({ success: false, message });
}

module.exports = { errorHandler };
