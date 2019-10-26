import Query from './query'

export default class Interface extends Query {
  constructor (pool, table) {
    super(table)
    this.pool = pool
  }

  async connect () {
    /**
     * Connect to database
     * @return Promise
     */
  }

  async execute () {
    /**
     * Execute query
     * @return Promise
     */
  }

  then (resolve, reject) {
    return this.execute().then(resolve, reject)
  }

  catch (reject) {
    return this.execute().catch(reject)
  }
}