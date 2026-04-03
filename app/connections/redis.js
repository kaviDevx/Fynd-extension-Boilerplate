"use strict";

const { Fit } = require("fit");
const { constant } = require("../constants");

// Fit.connections.redis is populated after redis.init() resolves in index.js
// Key pattern: DB_NAME ("fynd_extension_boilerplate") → Fit.connections.redis["fynd_extension_boilerplate"]
const hostRedis = Fit.connections.redis?.[constant.DB_NAME].write;

module.exports = { hostRedis };
