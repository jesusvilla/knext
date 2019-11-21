export default class Pool {
  constructor (config) {
    this.config = config
    this.Client = require('node-firebird-dev')
  }

  create (cb) {
    this.Client.attach(this.config.connection, cb)
  }

  validate (client) {
    return true
  }

  destroy (client) {
    return new Promise((resolve, reject) => {
      client.detach()
      resolve()
    })
  }
}