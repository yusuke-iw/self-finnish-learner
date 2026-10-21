const mongoose = require('mongoose');

// Without a DB connection, Mongoose buffers queries for 10 s before failing,
// so every data-access function checks this first and goes straight to the
// built-in seed data instead of waiting.
const isDbConnected = () => mongoose.connection.readyState === 1;

// Value of the `source` field in API responses.
const currentSource = () => (isDbConnected() ? 'database' : 'memory');

module.exports = { isDbConnected, currentSource };
