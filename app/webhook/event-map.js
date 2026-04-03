"use strict";

const { productDelete, orderPlaced } = require("./handlers");

/**
 * Webhook event map — registered via setupFdk webhook_config.event_map
 *
 * Event name format:
 *   "company/<domain>/<action>"      — company-level events
 *   "application/<domain>/<action>"  — sales-channel-level events
 *
 * Add or remove events as needed for your extension.
 * Each event must have: handler function + version string.
 */
const eventMap = {
  "company/product/delete": {
    handler: productDelete,
    version: "1",
  },
  // "application/order/placed": {
  //   handler: orderPlaced,
  //   version: "1",
  // },
};

module.exports = eventMap;
