"use strict";

const _ = require("lodash");
const convict = require("convict");
const mongodbUri = require("mongodb-uri");

convict.addFormat({
  name: "mongo-uri",
  validate: function (val) {
    let parsed = mongodbUri.parse(val);
    mongodbUri.format(parsed);
  },
  coerce: function (urlString) {
    if (urlString) {
      let parsed = mongodbUri.parse(urlString);
      urlString = mongodbUri.format(parsed);
    }
    return urlString;
  },
});

const config = convict({
  APP_IDENTIFIER: {
    doc: "Unique app identifier used as Redis/Mongo key prefix",
    format: String,
    default: "fynd-extension-boilerplate",
    env: "APP_IDENTIFIER",
  },
  env: {
    doc: "Node environment",
    format: ["development", "production", "test"],
    default: "development",
    env: "NODE_ENV",
  },
  mode: {
    doc: "App run mode: server | cron | worker",
    format: String,
    default: "server",
    env: "MODE",
  },
  fdk_debug: {
    doc: "Enable FDK verbose logging (curl commands + token responses). Default false — very noisy.",
    format: Boolean,
    default: false,
    env: "FDK_DEBUG",
  },
  port: {
    doc: "HTTP server port",
    format: "port",
    default: 8080,
    env: "PORT",
  },
  log_level: {
    doc: "Winston log level",
    format: String,
    default: "info",
    env: "LOG_LEVEL",
  },
  cluster_url: {
    doc: "Fynd Platform API cluster URL (e.g. https://api.fyndx0.de for sandbox)",
    format: String,
    default: "https://api.fynd.com",
    env: "EXTENSION_CLUSTER_URL",
  },
  extension: {
    api_key: {
      doc: "Extension API key from Fynd Partners panel",
      format: String,
      default: "",
      env: "EXTENSION_API_KEY",
    },
    api_secret: {
      doc: "Extension API secret from Fynd Partners panel",
      format: String,
      default: "",
      env: "EXTENSION_API_SECRET",
    },
  },
  BROWSER_CONFIG: {
    HOST_MAIN_URL: {
      doc: "Public extension base URL (must match Launch URL in Partners panel)",
      format: String,
      default: "",
      env: "EXTENSION_BASE_URL",
    },
  },
  mongo: {
    uri: {
      doc: "MongoDB read-write connection URI",
      format: "mongo-uri",
      default: "mongodb://127.0.0.1:27017/fynd-extension-boilerplate",
      env: "MONGO_FYND_EXTENSION_BOILERPLATE_READ_WRITE",
    },
  },
  redis: {
    uri: {
      doc: "Redis read-write connection URI",
      format: String,
      default: "redis://localhost:6379/0",
      env: "REDIS_FYND_EXTENSION_BOILERPLATE_READ_WRITE",
    },
  },
  sentry: {
    dsn: {
      doc: "Sentry DSN for error tracking",
      format: String,
      default: "",
      env: "SENTRY_DSN",
    },
    environment: {
      doc: "Sentry environment tag",
      format: String,
      default: "development",
      env: "SENTRY_ENVIRONMENT",
    },
  },
  newrelic: {
    app_name: {
      doc: "New Relic application name",
      format: String,
      default: "",
      env: "NEW_RELIC_APP_NAME",
    },
    license_key: {
      doc: "New Relic license key",
      format: String,
      default: "",
      env: "NEW_RELIC_LICENSE_KEY",
    },
  },
});

config.validate({ allowed: "strict" });

_.extend(config, config.get());

module.exports = config;
