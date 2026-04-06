const mongoose = require("mongoose");

const globalCache = global.mongooseCache || {
  connection: null,
  promise: null
};

global.mongooseCache = globalCache;

async function connectDB() {
  if (globalCache.connection) {
    return globalCache.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Please add it to your environment variables.");
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || undefined
      })
      .catch((error) => {
        globalCache.promise = null;
        throw error;
      });
  }

  globalCache.connection = await globalCache.promise;
  return globalCache.connection;
}

module.exports = connectDB;
