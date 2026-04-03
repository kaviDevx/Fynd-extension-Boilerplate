"use strict";

// fit/tracing provides a pre-configured Winston logger with structured JSON output
// It automatically includes service name, environment, and request tracing context
const pkg = require("fit/tracing");
const { logger } = pkg;

module.exports = logger;
