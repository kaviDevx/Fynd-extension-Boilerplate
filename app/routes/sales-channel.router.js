"use strict";

const express = require("express");
const logger = require("../common/logger");
const SalesChannel = require("../models/sales-channel.model");

const router = express.Router();

/**
 * All routes mounted under fdkExtension.apiRoutes → /api/v1/sales-channels
 * req.platformClient and req.fdkSession are injected by fdkHandler.
 *
 * Response shape matches nitrozen-react-extension's SalesChannel component expectation:
 *   { applications: [{ id, name, logo, domain, is_active }], page: {...} }
 */

// GET /api/v1/sales-channels?page=1&limit=10&search=
router.get("/", async (req, res, next) => {
  try {
    const { platformClient, query = {} } = req;
    const company_id = Number(req.headers["x-company-id"]);

    const applicationResult = await platformClient.configuration.getApplications({
      pageSize: parseInt(query.limit) || 10,
      pageNo: parseInt(query.page) || 1,
      q: query.search,
    });

    const applicationIds = applicationResult?.items.map((app) => app.id || app._id);

    // Fetch saved activation states from DB for this company
    const savedStates = await SalesChannel.find({
      company_id,
      application_id: { $in: applicationIds },
      is_active: true,
    }).lean();

    const activeAppIds = savedStates.map((doc) => doc.application_id);

    const applications = applicationResult?.items.map((app) => ({
      id: app.id || app._id,
      name: app.name,
      logo: app.logo,
      domain: app.domain,
      is_active: activeAppIds.includes(app.id || app._id),
    }));

    logger.info("Fetched sales channels", { company_id, count: applications.length });
    return res.json({ applications, page: applicationResult.page });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sales-channels/:application_id
router.get("/:application_id", async (req, res, next) => {
  try {
    const { application_id } = req.params;
    const company_id = Number(req.headers["x-company-id"]);

    const data = await SalesChannel.findOne({ company_id, application_id }).lean();
    return res.status(200).json(data || { application_id, is_active: false });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/sales-channels/:application_id — toggle activation
router.post("/:application_id", async (req, res, next) => {
  try {
    const { application_id } = req.params;
    const { is_active } = req.body;
    const company_id = Number(req.headers["x-company-id"]);

    const updated = await SalesChannel.findOneAndUpdate(
      { company_id, application_id },
      { $set: { is_active } },
      { upsert: true, new: true }
    );

    logger.info("Sales channel toggled", { company_id, application_id, is_active });
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
