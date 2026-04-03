"use strict";

const express = require("express");
const logger = require("../common/logger");

const router = express.Router();

/**
 * All routes here are mounted under fdkExtension.apiRoutes → /api/v1
 * req.platformClient is injected by fdkHandler middleware.
 * req.fdkSession contains: { company_id, application_id, ... }
 */

// GET /api/v1/products
// Example: list company products via platformClient (Fynd SDK)
router.get("/products", async (req, res, next) => {
  try {
    const { platformClient, fdkSession } = req;
    logger.info("Fetching products", { company_id: fdkSession?.company_id });

    const data = await platformClient.catalog.getProducts({ pageNo: 1, pageSize: 10 });
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/products/application/:application_id
// Example: list application-scoped products
router.get("/products/application/:application_id", async (req, res, next) => {
  try {
    const { platformClient } = req;
    const { application_id } = req.params;

    const data = await platformClient
      .application(application_id)
      .catalog.getAppProducts();
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
