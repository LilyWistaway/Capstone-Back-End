const pool = require("./pool");

/**
 * Runs a parameterized SQL query against the database.
 * @param {string} text - SQL query text
 * @param {any[]} params - parameter values
 * @returns {Promise<any>} query result
 */
async function query(text, params = []) {
  return pool.query(text, params);
}

module.exports = { query };
