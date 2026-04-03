"use strict";

const mongoose = require("mongoose");

/**
 * Example model: tracks per-company installation state.
 * Uses the mongoConnection from fit — connection is established before this module loads.
 */
const companySchema = new mongoose.Schema(
  {
    company_id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    versionKey: false,
  }
);

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
