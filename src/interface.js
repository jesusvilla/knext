export default Interface => class extends Interface {
  constructor (pool, table) {
    super(table)
    this.pool = pool
  }

  async connect () {
    const acquire = this.pool.acquire()
    return acquire.promise
  }

  then (resolve, reject) {
    return this.execute().then(resolve, reject)
  }

  catch (reject) {
    return this.execute().catch(reject)
  }
}