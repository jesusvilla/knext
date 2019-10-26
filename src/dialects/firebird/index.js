import Interface from './interface'

export default function Knex (config) {
  const Firebird = require('node-firebird-dev')
  const pool = Firebird.pool(config.connection.pool || 10, config.connection)

  return function (table) {
    return new Interface(pool, table)
  }
}