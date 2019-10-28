// "build": "cross-env BABEL_ENV=production parcel build --target node --no-source-maps src/index.js -d lib",
import mixin from '@utils/mixin'

module.exports = function Knex (config) {
  const BASE_IMPORT = `./dialects/${config.client}`

  const Pool = require(`${BASE_IMPORT}/pool`).default
  const InterfaceCore = require(`${BASE_IMPORT}/interface`).default
  const QueryCore = require(`${BASE_IMPORT}/query`).default

  class Interface extends mixin(InterfaceCore, QueryCore) {
    constructor (pool, table) {
      super(table)
      this.pool = pool
    }
  }

  const pool = Pool(config)

  return function (table) {
    return new Interface(pool, table)
  }
}