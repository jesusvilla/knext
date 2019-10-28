export default function (config) {
  const { Pool } = require('pg')
  return new Pool(config.connection)
}