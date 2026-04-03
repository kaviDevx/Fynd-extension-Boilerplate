"use strict";

require("dotenv").config();

const config = require("./app/common/config");
const logger = require("./app/common/logger");
const mongo = require("fit/mongo");
const redis = require("fit/redis");
const { mongoOptions } = require("./app/constants");

// Wire fit connection keys before init
// fit key rule: "fynd-extension-boilerplate" → replace hyphens → "fynd_extension_boilerplate" → uppercase → "FYND_EXTENSION_BOILERPLATE"
// env var: MONGO_FYND_EXTENSION_BOILERPLATE_READ_WRITE
// Without replacing hyphens, fit creates a SECOND connection under "fynd-extension-boilerplate" key (double logs)
const DB_KEY = config.APP_IDENTIFIER.replace(/-/g, "_").toUpperCase();

process.env.SERVER_TYPE = config.mode;
process.env.PORT = config.port;
process.env.COOKIE_SECRET = "ext.session";
process.env[`MONGO_${DB_KEY}_READ_WRITE`] = config.mongo.uri;
process.env[`REDIS_${DB_KEY}_READ_WRITE`] = config.redis.uri;

Promise.all([
  mongo.init(mongoOptions),
  redis.init(),
])
  .then(() => {
    if (config.mode === "server") {
      require("./app/server");
    } else {
      logger.error(`Unknown mode: ${config.mode}`);
      process.exit(1);
    }

    process.on("uncaughtException", (err) => {
      logger.error("Uncaught Exception", err);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection", { promise, reason });
    });
  })
  .catch((err) => {
    logger.error("Failed to initialize connections", err);
    process.exit(1);
  });
