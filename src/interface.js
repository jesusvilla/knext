const Query = require('./query')

async function execute () {
  const client = await this.pool.connect()
  try {
    const res = await client.query(this.toString(), this.params)
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

class Interface extends Query {
  constructor (pool, table) {
    super(table)
    this.pool = pool
  }

  then (resolve, reject) {
    return execute.call(this).then(resolve, reject)
  }

  catch (reject) {
    return execute.call(this).catch(reject)
  }
}

module.exports = Interface