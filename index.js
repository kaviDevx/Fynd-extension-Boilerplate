"use strict";

require("dotenv").config();

const config = require("./app/common/config");
const logger = require("./app/common/logger");
const mongo = require("fit/mongo");
const redis = require("fit/redis");
const { mongoOptions } = require("./app/constants");

// Wire fit connection keys before init
// fit derives key from SERVICE_NAME: "my-ext" → "my_ext"
// Then expects env var: MONGO_MY_EXT_READ_WRITE
process.env.SERVER_TYPE = config.mode;
process.env.PORT = config.port;
process.env.COOKIE_SECRET = "ext.session";
process.env[`MONGO_${config.APP_IDENTIFIER.toUpperCase()}_READ_WRITE`] = config.mongo.uri;
process.env[`REDIS_${config.APP_IDENTIFIER.toUpperCase()}_READ_WRITE`] = config.redis.uri;

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
