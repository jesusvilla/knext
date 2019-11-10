// "build": "cross-env BABEL_ENV=production parcel build --target node --no-source-maps src/index.js -d lib",
// import mixin from '@utils/mixin'

module.exports = function Knex (config) {
  const BASE_IMPORT = `./dialects/${config.client}`

  const Pool = require(`${BASE_IMPORT}/pool`).default

  const InterfaceMixin = require(`${BASE_IMPORT}/interface`).default
  const QueryMixin = require(`${BASE_IMPORT}/query`).default

  const Query = require('./query').default

  const Interface = require('./interface').default(InterfaceMixin(QueryMixin(Query)))

  const pool = Pool(config)

  return function (table) {
    return new Interface(pool, table)
  }
}