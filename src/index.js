// "build": "cross-env BABEL_ENV=production parcel build --target node --no-source-maps src/index.js -d lib",
// import mixin from '@utils/mixin'

module.exports = function Knex (config) {
  const BASE_IMPORT = `./dialects/${config.client}`

  const PoolCore = require(`${BASE_IMPORT}/pool`).default

  const InterfaceMixin = require(`${BASE_IMPORT}/interface`).default
  const QueryMixin = require(`${BASE_IMPORT}/query`).default

  const Query = require('./query').default

  const Interface = require('./interface').default(InterfaceMixin(QueryMixin(Query)))

  const poolCore = new PoolCore(config)
  const { Pool } = require('tarn')
  const pool = new Pool({
    min: 0,
    max: 10,
    idleTimeoutMillis: 2000, // Tiempo de espera para destruir un recurso inactivo
    create: poolCore.create.bind(poolCore),
    validate: poolCore.validate.bind(poolCore),
    destroy: poolCore.destroy.bind(poolCore)
  }, config.connection.pool)

  return function (table) {
    return new Interface(pool, table)
  }
}