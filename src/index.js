import Interface from './interface'

export default function Knex (config) {
  const { Pool } = require('pg')
  const pool = new Pool(config.connection)

  return function (table) {
    return new Interface(pool, table)
  }
}