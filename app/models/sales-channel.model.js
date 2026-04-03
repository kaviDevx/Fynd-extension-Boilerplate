"use strict";

const mongoose = require("mongoose");

/**
 * Tracks per-sales-channel activation state for this extension.
 * One document per (company_id + application_id) pair.
 * Fynd doesn't store extension-specific on/off state — this model owns it.
 */
const salesChannelSchema = new mongoose.Schema(
  {
    company_id: {
      type: Number,
      required: true,
      index: true,
    },
    application_id: {
      type: String,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound unique index — one record per company + sales channel
salesChannelSchema.index({ company_id: 1, application_id: 1 }, { unique: true });

const SalesChannel = mongoose.model("SalesChannel", salesChannelSchema);

module.exports = SalesChannel;
