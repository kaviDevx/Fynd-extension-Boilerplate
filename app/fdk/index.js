"use strict";

const { setupFdk } = require("@gofynd/fdk-extension-javascript/express");
const {
  MultiLevelStorage,
} = require("@gofynd/fdk-extension-javascript/express/storage");
const mongoose = require("mongoose");
const config = require("../common/config");
const logger = require("../common/logger");
const { hostRedis } = require("../connections/redis");
const { constant } = require("../constants");
const eventMap = require("../webhook/event-map");

const baseUrl = config.BROWSER_CONFIG.HOST_MAIN_URL;

// MultiLevelStorage: writes tokens to Redis (fast) + Mongoose (persistent fallback)
// Never use SQLiteStorage in production — it doesn't scale across multiple pods
mongoose.connect(config.mongo.uri, {
  autoIndex: false,
  appName: constant.EXTENSION_NAME,
  connectTimeoutMS: 10000,
  maxIdleTimeMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

const multiLevelStorage = new MultiLevelStorage(
  config.APP_IDENTIFIER,
  hostRedis,
  mongoose
);

const fdkInstances = {};

/**
 * Lazily initializes an FDK instance by name.
 * Supports multiple FDK instances (e.g. "main", "worker") without re-creating them.
 */
const initFDK = (instanceName, opts = {}) => {
  if (fdkInstances[instanceName]?.webhookRegistry) {
    return fdkInstances[instanceName];
  }

  let fdkInstance = {};

  try {
    fdkInstance = setupFdk({
      api_key: config.extension.api_key,
      api_secret: config.extension.api_secret,
      cluster: config.cluster_url,
      base_url: baseUrl,
      callbacks: {
        install: async (req) => {
          logger.info("Extension install", {
            company_id: req.query?.company_id,
            application_id: req.query?.application_id,
          });
          let launchUrl = `${req.extension?.base_url}/company/${req.query?.company_id}`;
          if (req.query?.application_id) {
            launchUrl += `/application/${req.query?.application_id}`;
          }
          return launchUrl;
        },

        auth: async (req) => {
          logger.info("Extension auth", {
            company_id: req.query?.company_id,
            application_id: req.query?.application_id,
          });
          let launchUrl = `${req.extension?.base_url}/company/${req.query?.company_id}`;
          if (req.query?.application_id) {
            launchUrl += `/application/${req.query?.application_id}`;
          }
          return launchUrl;
        },

        uninstall: async (req) => {
          logger.info("Extension uninstall", {
            company_id: req.query?.company_id,
          });
          // Clean up company-specific data here (async if time-consuming)
        },
      },
      storage: multiLevelStorage,
      access_mode: "offline",
      // access_mode: "online",  // Use "online" if extension needs to act as the logged-in user
      // Logs all FDK HTTP calls as curl commands + full token responses.
      // Default false. Enable via FDK_DEBUG=true in .env when debugging auth issues.
      debug: config.fdk_debug,
      webhook_config: {
        api_path: "/api/webhook-events",
        notification_email: "team@example.com", // update this
        subscribe_on_install: true,
        event_map: eventMap,
      },
      ...opts,
    });
  } catch (error) {
    logger.error("Error setting up FDK", error);
    throw error;
  }

  fdkInstances[instanceName] = fdkInstance;
  return fdkInstance;
};

const FDKExtension = initFDK("main");

module.exports = { FDKExtension, multiLevelStorage, initFDK };
