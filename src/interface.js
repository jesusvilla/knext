import Query from './query'

async function execute () {
  const client = await this.pool.connect()
  try {
    const query = this.toSQL()
    const res = await client.query(query.sql, query.bindings)
    return res.rows
  } finally {
    await client.release()
  }
}

/* function execute () {
    return this.pool.connect().then(client => {
        return client.query(this.toString())
        .then(res => res.rows)
        .finally(() => {
            client.release()
        })
    })
} */

export default class Interface extends Query {
  constructor (pool, table) {
    super(table)
    this.pool = pool
  }

  /* #execute () {

  } */

  then (resolve, reject) {
    return execute.call(this).then(resolve, reject)
  }

  catch (reject) {
    return execute.call(this).catch(reject)
  }
}