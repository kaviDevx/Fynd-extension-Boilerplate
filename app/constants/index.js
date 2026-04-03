"use strict";

// APP_IDENTIFIER must be kebab-case (matches SERVICE_NAME env convention)
// fit key derivation: "my-ext" → "my_ext" → MONGO_MY_EXT_READ_WRITE
const constant = {
  APP_IDENTIFIER: "fynd-extension-boilerplate", // change to your extension name
  DB_NAME: "fynd_extension_boilerplate",         // underscored version of above
  EXTENSION_NAME: "fynd-extension-boilerplate",
};

const mongoOptions = {
  options: {
    read: {
      appName: constant.EXTENSION_NAME,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
    write: {
      appName: constant.EXTENSION_NAME,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
};

module.exports = { constant, mongoOptions };
