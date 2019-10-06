const Interface = require('./interface')

function Knex (config) {
  const { Pool } = require('pg')
  const pool = new Pool(config.connection)

  return function (table) {
    return new Interface(pool, table)
  }
}
module.exports = Knex