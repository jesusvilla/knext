export default Interface => class extends Interface {
  constructor (pool, table) {
    super(table)
    this.pool = pool
  }

  then (resolve, reject) {
    return this.execute().then(resolve, reject)
  }

  catch (reject) {
    return this.execute().catch(reject)
  }
}