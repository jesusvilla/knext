export default class Pool {
  constructor (config) {
    this.config = config
    this.Client = require('pg').Client
  }

  async create () {
    const client = new this.Client(this.config.connection)
    await client.connect()
    return client
  }

  validate (client) {
    return true
  }

  destroy (client) {
    return client.end()
  }
}