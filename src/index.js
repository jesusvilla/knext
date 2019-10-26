// "build": "cross-env BABEL_ENV=production parcel build --target node --no-source-maps src/index.js -d lib",
module.exports = function Knex (config) {
  return require(`./dialects/${config.client}`).default(config)
}