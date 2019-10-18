import Interface from './interface'
// "build": "cross-env BABEL_ENV=production parcel build --target node --no-source-maps src/index.js -d lib",

module.exports = function Knex (config) {
  const { Pool } = require('pg')
  const pool = new Pool(config.connection)

  return function (table) {
    return new Interface(pool, table)
  }
}