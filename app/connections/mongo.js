"use strict";

const { Fit } = require("fit");
const { constant } = require("../constants");

// Fit.connections.mongo is populated after mongo.init() resolves in index.js
// Key pattern: DB_NAME ("fynd_extension_boilerplate") → Fit.connections.mongo["fynd_extension_boilerplate"]
/** @type {import('mongoose').Connection} */
const mongoConnection = Fit.connections.mongo?.[constant.DB_NAME].write;

module.exports = { mongoConnection };
