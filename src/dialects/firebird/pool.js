export default function (config) {
  const Firebird = require('node-firebird-dev')
  return Firebird.pool(config.connection.pool || 10, config.connection)
}