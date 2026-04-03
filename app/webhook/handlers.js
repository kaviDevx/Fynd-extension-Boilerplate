"use strict";

const logger = require("../common/logger");

/**
 * Webhook handler signature:
 *   async (eventData, company_id, application_id) => void
 *
 * eventData  — full webhook payload from Fynd
 * company_id — company that triggered the event
 * application_id — sales channel ID (null for company-level events)
 *
 * All handlers are registered in event-map.js and wired via setupFdk webhook_config.
 * Errors thrown here are caught by fdkExtension.webhookRegistry.processWebhook().
 */

async function productDelete(eventData, company_id, application_id) {
  logger.info("Webhook: company/product/delete", { company_id, application_id });
  // TODO: handle product deletion logic
}

async function orderPlaced(eventData, company_id, application_id) {
  logger.info("Webhook: application/order/placed", { company_id, application_id });
  // TODO: handle order placed logic
}

module.exports = { productDelete, orderPlaced };
